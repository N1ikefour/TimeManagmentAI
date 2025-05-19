import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import {
  focusService,
  FocusSession,
  SessionStats,
} from "../services/focusService";

export const useFocus = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [dailyStats, setDailyStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка активной сессии и статистики
  useEffect(() => {
    if (user) {
      loadActiveSession();
      loadDailyStats();
    }
  }, [user]);

  const loadActiveSession = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const session = await focusService.getActiveSession(user.id);
      setActiveSession(session);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load active session"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDailyStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const stats = await focusService.getDailyStats(user.id, today);
      setDailyStats(stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load daily stats"
      );
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (taskId?: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const session = await focusService.startSession(user.id, taskId);
      setActiveSession(session);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (notes?: string) => {
    if (!activeSession) return;
    try {
      setLoading(true);
      const session = await focusService.endSession(activeSession.id, notes);
      setActiveSession(null);
      await loadDailyStats(); // Обновляем статистику
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSession,
    dailyStats,
    loading,
    error,
    startSession,
    endSession,
    refreshStats: loadDailyStats,
  };
};
