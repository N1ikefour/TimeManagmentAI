import { useState, useEffect } from "react";
import { taskService, Task } from "../services/taskService";
import { useAuth } from "../context/AuthContext";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTasks = async () => {
    console.log("useTasks: Current user:", user);
    if (!user) {
      console.log("useTasks: No user found, skipping task fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("useTasks: Fetching tasks for user:", user.id);
      const data = await taskService.getTasks(user.id);
      console.log("useTasks: Fetched tasks:", data);
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error("useTasks: Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const newTask = await taskService.createTask(task);
      setTasks((prev) => [...prev, newTask]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const updatePriority = async (taskId: string, priority: number) => {
    try {
      const updatedTask = await taskService.updateTaskPriority(
        taskId,
        priority
      );
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update priority"
      );
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    updatePriority,
    refreshTasks: fetchTasks,
  };
};
