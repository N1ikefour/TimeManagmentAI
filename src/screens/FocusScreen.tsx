import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import {
  Text,
  Button,
  IconButton,
  Portal,
  Dialog,
  TextInput,
} from "react-native-paper";
import { router } from "expo-router";
import { useTasks } from "../hooks/useTasks";
import { useFocus } from "../hooks/useFocus";
import { Task } from "../services/taskService";

const FOCUS_TIME = 25 * 60; // 25 минут в секундах
const BREAK_TIME = 5 * 60; // 5 минут в секундах

export const FocusScreen = () => {
  const { tasks } = useTasks();
  const {
    activeSession,
    dailyStats,
    startSession,
    endSession,
    loading,
    error,
  } = useFocus();
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  // Форматирование времени в формат MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Обработка таймера
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Время истекло
      setIsRunning(false);
      if (!isBreak) {
        // Завершение фокуса
        setShowSessionComplete(true);
      } else {
        // Завершение перерыва
        setIsBreak(false);
        setTimeLeft(FOCUS_TIME);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const handleStart = async () => {
    if (!currentTask && !isBreak) {
      setShowTaskSelector(true);
      return;
    }
    if (currentTask) {
      await startSession(currentTask.id);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : FOCUS_TIME);
  };

  const handleTaskSelect = (task: Task) => {
    setCurrentTask(task);
    setShowTaskSelector(false);
    setTimeLeft(FOCUS_TIME);
  };

  const handleStartBreak = () => {
    setIsBreak(true);
    setTimeLeft(BREAK_TIME);
    setIsRunning(true);
    setCurrentTask(null);
  };

  const handleCompleteSession = async () => {
    if (activeSession) {
      await endSession(sessionNotes);
      setShowSessionComplete(false);
      setSessionNotes("");
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text variant="headlineMedium">Focus Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {currentTask && !isBreak && (
          <View style={styles.taskInfo}>
            <Text variant="titleLarge">{currentTask.title}</Text>
            <Text variant="bodyMedium">{currentTask.description}</Text>
          </View>
        )}

        <View style={styles.timerContainer}>
          <Text variant="displayLarge" style={styles.timer}>
            {formatTime(timeLeft)}
          </Text>
          <Text variant="titleMedium" style={styles.timerLabel}>
            {isBreak ? "Break Time" : "Focus Time"}
          </Text>
        </View>

        {dailyStats && (
          <View style={styles.statsContainer}>
            <Text variant="bodyMedium">
              Today's Focus: {Math.floor(dailyStats.total_focus_time / 60)}{" "}
              minutes
            </Text>
            <Text variant="bodyMedium">
              Sessions: {dailyStats.total_sessions}
            </Text>
          </View>
        )}

        <View style={styles.controls}>
          {!isRunning ? (
            <Button mode="contained" onPress={handleStart} disabled={loading}>
              {currentTask || isBreak ? "Start" : "Select Task"}
            </Button>
          ) : (
            <Button mode="contained" onPress={handlePause} disabled={loading}>
              Pause
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={handleReset}
            style={styles.button}
            disabled={loading}
          >
            Reset
          </Button>
          {!isBreak && (
            <Button
              mode="outlined"
              onPress={handleStartBreak}
              style={styles.button}
              disabled={loading}
            >
              Take a Break
            </Button>
          )}
        </View>
      </View>

      <Portal>
        <Dialog
          visible={showTaskSelector}
          onDismiss={() => setShowTaskSelector(false)}
        >
          <Dialog.Title>Select Task</Dialog.Title>
          <Dialog.Content>
            {tasks
              .filter((task) => !task.completed)
              .map((task) => (
                <Button
                  key={task.id}
                  mode="outlined"
                  onPress={() => handleTaskSelect(task)}
                  style={styles.taskButton}
                >
                  {task.title}
                </Button>
              ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTaskSelector(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showSessionComplete}
          onDismiss={() => setShowSessionComplete(false)}
        >
          <Dialog.Title>Session Complete!</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Session Notes"
              value={sessionNotes}
              onChangeText={setSessionNotes}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSessionComplete(false)}>
              Cancel
            </Button>
            <Button onPress={handleCompleteSession} loading={loading}>
              Complete
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: {
    width: "100%",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 32,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  timer: {
    fontSize: 72,
    fontWeight: "bold",
  },
  timerLabel: {
    marginTop: 8,
  },
  controls: {
    width: "100%",
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
  taskButton: {
    marginVertical: 4,
  },
  statsContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  notesInput: {
    marginTop: 8,
  },
});
