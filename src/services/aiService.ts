import { supabase } from "../config/supabase";
import { Task } from "./taskService";

interface AIResponse {
  message: string;
  task?: Omit<Task, "id" | "created_at" | "updated_at">;
}

export const aiService = {
  async analyzeTasks(userId: string): Promise<AIResponse> {
    try {
      // Получаем задачи пользователя
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: false });

      if (tasksError) {
        console.error("aiService: Error fetching tasks:", tasksError);
        throw tasksError;
      }

      // Получаем статистику фокус-сессий
      const { data: stats, error: statsError } = await supabase
        .from("session_stats")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(7);

      if (statsError) {
        console.error("aiService: Error fetching stats:", statsError);
        throw statsError;
      }

      // Анализируем данные
      const completedTasks = tasks.filter((task) => task.completed).length;
      const totalTasks = tasks.length;
      const completionRate =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const totalFocusTime = stats.reduce(
        (sum, stat) => sum + stat.total_focus_time,
        0
      );
      const averageFocusTime =
        stats.length > 0 ? totalFocusTime / stats.length : 0;

      // Формируем рекомендации
      let message = "Here's your productivity analysis:\n\n";
      message += `• Task Completion Rate: ${completionRate.toFixed(1)}%\n`;
      message += `• Average Daily Focus Time: ${Math.floor(
        averageFocusTime / 60
      )} minutes\n\n`;

      if (completionRate < 50) {
        message +=
          "You might want to break down your tasks into smaller, more manageable pieces.\n";
      }

      if (averageFocusTime < 3600) {
        message +=
          "Consider increasing your daily focus time to improve productivity.\n";
      }

      // Предлагаем новую задачу на основе анализа
      const incompleteTasks = tasks.filter((task) => !task.completed);
      if (incompleteTasks.length > 0) {
        const suggestedTask = incompleteTasks[0];
        message += "\nSuggested next task:\n";
        message += `• ${suggestedTask.title}\n`;
        if (suggestedTask.description) {
          message += `  ${suggestedTask.description}\n`;
        }
      }

      return {
        message,
        task:
          incompleteTasks.length > 0
            ? {
                user_id: userId,
                title: incompleteTasks[0].title,
                description: incompleteTasks[0].description,
                priority: incompleteTasks[0].priority,
                deadline: incompleteTasks[0].deadline,
                completed: false,
              }
            : undefined,
      };
    } catch (err) {
      console.error("aiService: Unexpected error:", err);
      throw err;
    }
  },

  async getTaskSuggestions(userId: string, query: string): Promise<AIResponse> {
    try {
      // В будущем здесь будет интеграция с реальным AI API
      // Сейчас просто возвращаем заглушку
      const suggestedTask = {
        user_id: userId,
        title: query,
        description: "Created from AI suggestion",
        priority: 1,
        deadline: null,
        completed: false,
      };

      return {
        message: `I've created a task based on your request: "${query}"`,
        task: suggestedTask,
      };
    } catch (err) {
      console.error("aiService: Unexpected error:", err);
      throw err;
    }
  },
};
