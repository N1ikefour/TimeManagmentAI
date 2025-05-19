import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  focusService,
  FocusSession,
  SessionStats,
} from "../services/focusService";

export const useFocus = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState<SessionStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSessions();
      loadStats();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await focusService.getSessions(user.id);
      setSessions(data);
      // Находим активную сессию (без end_time)
      const active = data.find((session) => !session.end_time);
      setActiveSession(active || null);
    } catch (err) {
      console.error("useFocus: Error loading sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // Статистика за последнюю неделю
      const data = await focusService.getStats(
        user.id,
        startDate.toISOString().split("T")[0],
        today.toISOString().split("T")[0]
      );
      setStats(data);
    } catch (err) {
      console.error("useFocus: Error loading stats:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (taskId: string | null = null) => {
    if (!user) return;
    try {
      setLoading(true);
      const session = await focusService.startSession(user.id, taskId);
      setActiveSession(session);
      await loadSessions();
    } catch (err) {
      console.error("useFocus: Error starting session:", err);
      setError("Failed to start focus session");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;
    try {
      setLoading(true);
      await focusService.endSession(activeSession.id);
      setActiveSession(null);
      await loadSessions();
      await loadStats();
    } catch (err) {
      console.error("useFocus: Error ending session:", err);
      setError("Failed to end focus session");
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSession,
    sessions,
    stats,
    loading,
    error,
    startSession,
    endSession,
    refresh: () => {
      loadSessions();
      loadStats();
    },
  };
};
