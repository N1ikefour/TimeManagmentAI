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
  useTheme,
  Menu,
  Divider,
} from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { router } from "expo-router";
import { Task } from "../services/taskService";
import { AIChatDialog } from "../components/AIChatDialog";

export const DashboardScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks();
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [aiChatVisible, setAiChatVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = async () => {
    closeMenu();
    try {
      await logout();
      router.replace("/welcome");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleFocusModePress = () => {
    closeMenu();
    router.push("/focus");
  };

  const handleAIChatPress = () => {
    closeMenu();
    setAiChatVisible(true);
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

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    weekday: "long",
  };
  const formattedDate = today.toLocaleDateString("en-US", options);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="displaySmall" style={styles.headerTitle}>
            Today
          </Text>
          <Text variant="bodySmall" style={styles.headerDate}>
            {formattedDate}
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton icon="dots-vertical" size={24} onPress={openMenu} />
          }
        >
          <Menu.Item
            onPress={handleFocusModePress}
            title="Focus Mode"
            leadingIcon="timer"
          />
          <Menu.Item
            onPress={handleAIChatPress}
            title="AI Chat"
            leadingIcon="robot"
          />
          <Divider />
          <Menu.Item
            onPress={handleLogout}
            title="Logout"
            leadingIcon="logout"
          />
        </Menu>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading tasks...</Text>
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <IconButton
                icon={task.completed ? "check-circle" : "circle-outline"}
                iconColor={
                  task.completed ? theme.colors.primary : theme.colors.onSurface
                }
                size={24}
                onPress={() => handleToggleComplete(task)}
              />
              <View style={styles.taskContent}>
                <Text variant="bodyLarge" style={styles.taskTitle}>
                  {task.title}
                </Text>
                {task.description ? (
                  <Text variant="bodyMedium" style={styles.taskDescription}>
                    {task.description}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={addTaskVisible}
          onDismiss={() => setAddTaskVisible(false)}
          style={styles.addTaskDialog}
        >
          <View style={styles.addTaskContainer}>
            <TextInput
              placeholder="Submit Project Proposal"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              style={styles.addTaskInput}
              underlineColorAndroid="transparent"
              multiline
              autoFocus
            />
            <View style={styles.detailButtonsContainer}>
              <Button
                icon="calendar-today"
                mode="outlined"
                style={styles.detailButton}
                labelStyle={styles.detailButtonLabel}
              >
                Today
              </Button>
              <Button
                icon="flag-outline"
                mode="outlined"
                style={styles.detailButton}
                labelStyle={styles.detailButtonLabel}
              >
                Priority
              </Button>
              <Button
                icon="bell-outline"
                mode="outlined"
                style={styles.detailButton}
                labelStyle={styles.detailButtonLabel}
              >
                Reminders
              </Button>
              <IconButton
                icon="dots-horizontal"
                style={styles.detailButton}
                size={20}
              />
            </View>
            <View style={styles.addTaskFooter}>
              <View style={styles.inboxContainer}>
                <IconButton icon="inbox" size={20} />
                <Text style={styles.inboxText}>Inbox</Text>
                <IconButton icon="chevron-down" size={20} />
              </View>
              <IconButton
                icon="arrow-up"
                size={24}
                onPress={handleAddTask}
                style={styles.addTaskSendButton}
                iconColor="#fff"
              />
            </View>
          </View>
        </Dialog>
      </Portal>

      <AIChatDialog
        visible={aiChatVisible}
        onDismiss={() => setAiChatVisible(false)}
        onTaskCreated={handleAITaskCreated}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddTaskVisible(true)}
      />
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
  },
  headerTitle: {
    fontWeight: "bold",
  },
  headerDate: {
    color: "#888",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  taskContent: {
    flex: 1,
    marginLeft: 8,
  },
  taskTitle: {},
  taskDescription: {
    color: "#555",
    marginTop: 4,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "red",
  },
  input: {
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#ea4c89",
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addTaskDialog: {
    backgroundColor: "#fff",
    marginHorizontal: 0,
    marginBottom: 0,
    marginTop: "auto",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    width: "100%",
  },
  addTaskContainer: {
    width: "100%",
  },
  addTaskInput: {
    backgroundColor: "transparent",
    fontSize: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 16,
  },
  detailButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  detailButton: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  detailButtonLabel: {
    fontSize: 12,
  },
  addTaskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inboxText: {
    fontSize: 14,
    marginRight: 4,
  },
  addTaskSendButton: {
    backgroundColor: "#ea4c89",
    borderRadius: 30,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
