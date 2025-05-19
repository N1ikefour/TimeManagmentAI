import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import {
  Text,
  FAB,
  Button,
  Portal,
  Dialog,
  TextInput,
  Card,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { router } from "expo-router";
import { Task } from "../services/taskService";
import { AIChatDialog } from "../components/AIChatDialog";

export const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks();
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [aiChatVisible, setAiChatVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/welcome");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await addTask({
        user_id: user!.id,
        title: newTask.title,
        description: newTask.description,
        deadline: newTask.deadline,
        priority: 0,
        completed: false,
      });
      setAddTaskVisible(false);
      setNewTask({ title: "", description: "", deadline: "" });
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleAITaskCreated = async (
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    try {
      await addTask({
        ...task,
        user_id: user!.id,
      });
    } catch (error) {
      console.error("Failed to create task from AI:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id, {
        ...task,
        completed: !task.completed,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Dashboard</Text>
        <Button onPress={handleLogout}>Logout</Button>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text>Loading tasks...</Text>
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content>
                <View style={styles.taskHeader}>
                  <Text variant="titleMedium">{task.title}</Text>
                  <IconButton
                    icon={task.completed ? "check-circle" : "circle-outline"}
                    onPress={() => handleToggleComplete(task)}
                  />
                </View>
                <Text variant="bodyMedium">{task.description}</Text>
                <View style={styles.taskFooter}>
                  <Text variant="bodySmall">Priority: {task.priority}</Text>
                  {task.deadline && (
                    <Text variant="bodySmall">Deadline: {task.deadline}</Text>
                  )}
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleDeleteTask(task.id)}>
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={addTaskVisible}
          onDismiss={() => setAddTaskVisible(false)}
        >
          <Dialog.Title>Add New Task</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, description: text })
              }
              multiline
              style={styles.input}
            />
            <TextInput
              label="Deadline"
              value={newTask.deadline}
              onChangeText={(text) =>
                setNewTask({ ...newTask, deadline: text })
              }
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddTaskVisible(false)}>Cancel</Button>
            <Button onPress={handleAddTask}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <AIChatDialog
        visible={aiChatVisible}
        onDismiss={() => setAiChatVisible(false)}
        onTaskCreated={handleAITaskCreated}
      />

      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setAddTaskVisible(true)}
          label="Add Task"
        />
        <FAB
          icon="robot"
          style={[styles.fab, styles.fabMargin]}
          onPress={() => setAiChatVisible(true)}
          label="AI Chat"
        />
        <FAB
          icon="timer"
          style={[styles.fab, styles.fabMargin]}
          onPress={() => router.push("/(auth)/focus")}
          label="Focus Mode"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 16,
    alignItems: "flex-end",
  },
  fab: {
    backgroundColor: "#6200ee",
  },
  fabMargin: {
    marginTop: 16,
  },
});
