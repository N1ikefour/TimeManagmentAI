import { supabase } from "../config/supabase";

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface SessionStats {
  id: string;
  user_id: string;
  date: string;
  total_focus_time: number;
  total_sessions: number;
  completed_tasks: number;
  created_at: string;
  updated_at: string;
}

export const focusService = {
  // Создание новой фокус-сессии
  async startSession(userId: string, taskId?: string): Promise<FocusSession> {
    const { data, error } = await supabase
      .from("focus_sessions")
      .insert([
        {
          user_id: userId,
          task_id: taskId || null,
          start_time: new Date().toISOString(),
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Завершение фокус-сессии
  async endSession(sessionId: string, notes?: string): Promise<FocusSession> {
    const endTime = new Date();
    const { data: session, error: fetchError } = await supabase
      .from("focus_sessions")
      .select("start_time, user_id")
      .eq("id", sessionId)
      .single();

    if (fetchError) throw fetchError;

    const startTime = new Date(session.start_time);
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    const { data, error } = await supabase
      .from("focus_sessions")
      .update({
        end_time: endTime.toISOString(),
        duration,
        completed: true,
        notes: notes || null,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;

    // Обновляем статистику
    await this.updateSessionStats(session.user_id, duration);

    return data;
  },

  // Получение активной сессии пользователя
  async getActiveSession(userId: string): Promise<FocusSession | null> {
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .is("end_time", null)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 - no rows returned
    return data;
  },

  // Получение статистики за день
  async getDailyStats(userId: string, date: string): Promise<SessionStats> {
    const { data, error } = await supabase
      .from("session_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Обновление статистики
  async updateSessionStats(userId: string, duration: number): Promise<void> {
    const today = new Date().toISOString().split("T")[0];

    // Получаем текущую статистику
    const { data: currentStats, error: fetchError } = await supabase
      .from("session_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    if (currentStats) {
      // Обновляем существующую статистику
      const { error: updateError } = await supabase
        .from("session_stats")
        .update({
          total_focus_time: currentStats.total_focus_time + duration,
          total_sessions: currentStats.total_sessions + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentStats.id);

      if (updateError) throw updateError;
    } else {
      // Создаем новую запись статистики
      const { error: insertError } = await supabase
        .from("session_stats")
        .insert([
          {
            user_id: userId,
            date: today,
            total_focus_time: duration,
            total_sessions: 1,
            completed_tasks: 0,
          },
        ]);

      if (insertError) throw insertError;
    }
  },
};
