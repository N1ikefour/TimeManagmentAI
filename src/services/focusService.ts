import { supabase } from "../config/supabase";

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionStats {
  id: string;
  user_id: string;
  date: string;
  total_focus_time: number;
  completed_tasks: number;
  created_at: string;
  updated_at: string;
}

export const focusService = {
  async startSession(userId: string, taskId: string | null = null) {
    try {
      const { data, error } = await supabase
        .from("focus_sessions")
        .insert({
          user_id: userId,
          task_id: taskId,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("focusService: Error starting session:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("focusService: Unexpected error starting session:", err);
      throw err;
    }
  },

  async endSession(sessionId: string) {
    try {
      const endTime = new Date();
      const { data: session, error: fetchError } = await supabase
        .from("focus_sessions")
        .select("start_time, user_id")
        .eq("id", sessionId)
        .single();

      if (fetchError) {
        console.error("focusService: Error fetching session:", fetchError);
        throw fetchError;
      }

      const startTime = new Date(session.start_time);
      const duration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      const { data, error } = await supabase
        .from("focus_sessions")
        .update({
          end_time: endTime.toISOString(),
          duration,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        console.error("focusService: Error ending session:", error);
        throw error;
      }

      // Обновляем статистику
      await this.updateStats(session.user_id, duration);

      return data;
    } catch (err) {
      console.error("focusService: Unexpected error ending session:", err);
      throw err;
    }
  },

  async updateStats(userId: string, duration: number) {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Получаем текущую статистику
      const { data: existingStats, error: fetchError } = await supabase
        .from("session_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("focusService: Error fetching stats:", fetchError);
        throw fetchError;
      }

      if (existingStats) {
        // Обновляем существующую статистику
        const { error } = await supabase
          .from("session_stats")
          .update({
            total_focus_time: existingStats.total_focus_time + duration,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingStats.id);

        if (error) {
          console.error("focusService: Error updating stats:", error);
          throw error;
        }
      } else {
        // Создаем новую запись статистики
        const { error } = await supabase.from("session_stats").insert({
          user_id: userId,
          date: today,
          total_focus_time: duration,
          completed_tasks: 0,
        });

        if (error) {
          console.error("focusService: Error creating stats:", error);
          throw error;
        }
      }
    } catch (err) {
      console.error("focusService: Unexpected error updating stats:", err);
      throw err;
    }
  },

  async getSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (error) {
        console.error("focusService: Error fetching sessions:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("focusService: Unexpected error fetching sessions:", err);
      throw err;
    }
  },

  async getStats(userId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from("session_stats")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) {
        console.error("focusService: Error fetching stats:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("focusService: Unexpected error fetching stats:", err);
      throw err;
    }
  },
};
