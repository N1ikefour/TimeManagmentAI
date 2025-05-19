import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Text,
  Button,
  Card,
  ProgressBar,
  IconButton,
  Portal,
  Dialog,
} from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { useFocus } from "../hooks/useFocus";
import { router } from "expo-router";
import { Task } from "../services/taskService";

const FOCUS_DURATION = 25 * 60; // 25 минут в секундах
const { width } = Dimensions.get("window");

export const FocusScreen = () => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const {
    activeSession,
    sessions,
    stats,
    loading: focusLoading,
    error: focusError,
    startSession,
    endSession,
  } = useFocus();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleStartSession = async () => {
    if (!selectedTask) {
      setShowTaskDialog(true);
      return;
    }
    try {
      await startSession(selectedTask.id);
      setIsRunning(true);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    if (activeSession) {
      try {
        await endSession();
        setTimeLeft(FOCUS_DURATION);
        setSelectedTask(null);
      } catch (error) {
        console.error("Failed to end session:", error);
      }
    }
  };

  const handlePauseSession = () => {
    setIsRunning(false);
  };

  const handleResumeSession = () => {
    setIsRunning(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    return 1 - timeLeft / FOCUS_DURATION;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Focus Mode
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.timerContainer}>
          <Text variant="displayLarge" style={styles.timerText}>
            {formatTime(timeLeft)}
          </Text>
          <ProgressBar
            progress={getProgress()}
            style={styles.progressBar}
            color="#ea4c89"
          />
          <View style={styles.timerControls}>
            {!isRunning ? (
              <Button
                mode="contained"
                onPress={
                  activeSession ? handleResumeSession : handleStartSession
                }
                style={styles.button}
              >
                {activeSession ? "Resume" : "Start Focus"}
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handlePauseSession}
                style={styles.button}
              >
                Pause
              </Button>
            )}
            {activeSession && (
              <Button
                mode="outlined"
                onPress={handleSessionComplete}
                style={[styles.button, styles.buttonOutlined]}
              >
                End Session
              </Button>
            )}
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Current Task
            </Text>
            {selectedTask ? (
              <View>
                <Text variant="bodyLarge" style={styles.taskTitle}>
                  {selectedTask.title}
                </Text>
                {selectedTask.description ? (
                  <Text variant="bodyMedium" style={styles.taskDescription}>
                    {selectedTask.description}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.noTaskText}>
                No task selected
              </Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setShowTaskDialog(true)} textColor="#ea4c89">
              {selectedTask ? "Change Task" : "Select Task"}
            </Button>
          </Card.Actions>
        </Card>

        {stats.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Today's Progress
              </Text>
              <View style={styles.statsContent}>
                <View style={styles.statItem}>
                  <Text variant="bodyMedium" style={styles.statValue}>
                    {Math.floor(
                      stats[stats.length - 1]?.total_focus_time / 60 || 0
                    )}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Minutes Focused
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="bodyMedium" style={styles.statValue}>
                    {stats[stats.length - 1]?.completed_tasks || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Tasks Completed
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={showTaskDialog}
          onDismiss={() => setShowTaskDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Select Task</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.taskList}>
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => {
                    setSelectedTask(task);
                    setShowTaskDialog(false);
                  }}
                >
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.taskItemTitle}>
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text
                        variant="bodyMedium"
                        style={styles.taskItemDescription}
                      >
                        {task.description}
                      </Text>
                    ) : null}
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowTaskDialog(false)}
              textColor="#ea4c89"
            >
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    borderBottomColor: "#eee",
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  timerContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    margin: 0,
  },
  timerText: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 8,
    marginBottom: 16,
    borderRadius: 4,
    backgroundColor: "#eee",
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutlined: {
    borderColor: "#ea4c89",
    borderWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    color: "#000",
    marginBottom: 12,
    fontWeight: "bold",
  },
  taskTitle: {
    color: "#000",
    marginBottom: 4,
  },
  taskDescription: {
    color: "#555",
  },
  noTaskText: {
    color: "#555",
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#555",
    marginTop: 4,
  },
  dialog: {
    backgroundColor: "#fff",
  },
  dialogTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  taskList: {
    maxHeight: 300,
  },
  taskItem: {
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
  },
  taskItemTitle: {
    color: "#000",
  },
  taskItemDescription: {
    color: "#555",
  },
});
