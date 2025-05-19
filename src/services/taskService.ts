import { supabase } from "../config/supabase";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  completed: boolean;
}

export const taskService = {
  async createTask(task: Omit<Task, "id" | "created_at" | "updated_at">) {
    console.log("taskService: Creating task:", task);
    try {
      // Проверяем сессию
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("taskService: Session error:", sessionError);
        throw new Error("Not authenticated");
      }

      if (!session) {
        console.error("taskService: No active session");
        throw new Error("Not authenticated");
      }

      // Проверяем, что user_id совпадает с текущим пользователем
      if (task.user_id !== session.user.id) {
        console.error("taskService: User ID mismatch", {
          taskUserId: task.user_id,
          sessionUserId: session.user.id,
        });
        throw new Error("User ID mismatch");
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: task.user_id,
          title: task.title,
          description: task.description || null,
          priority: task.priority || 0,
          deadline: task.deadline || null,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error("taskService: Error creating task:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }
      console.log("taskService: Successfully created task:", data);
      return data;
    } catch (err) {
      console.error("taskService: Unexpected error creating task:", err);
      throw err;
    }
  },

  async getTasks(userId: string) {
    console.log("taskService: Getting tasks for user:", userId);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: false });

      if (error) {
        console.error("taskService: Error fetching tasks:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }
      console.log("taskService: Successfully fetched tasks:", data);
      return data;
    } catch (err) {
      console.error("taskService: Unexpected error:", err);
      throw err;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) throw error;
  },

  async updateTaskPriority(taskId: string, priority: number) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ priority })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
