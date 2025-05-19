import { supabase } from "../config/supabase";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: number;
  deadline: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
}

export const taskService = {
  async createTask(task: Omit<Task, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...task, completed: false }])
      .select()
      .single();

    if (error) throw error;
    return data;
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
