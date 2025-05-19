import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Text, Button, ProgressBar } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export const FocusModeScreen = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 минут в секундах
  const [isActive, setIsActive] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Здесь можно добавить уведомление о завершении сессии
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setTimeLeft(25 * 60);
    setIsActive(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Focus Mode
        </Text>

        <View style={styles.timerContainer}>
          <Text variant="displayLarge" style={styles.timer}>
            {formatTime(timeLeft)}
          </Text>
          <ProgressBar
            progress={1 - timeLeft / (25 * 60)}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={toggleTimer} style={styles.button}>
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button mode="outlined" onPress={resetTimer} style={styles.button}>
            Reset
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 40,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  timer: {
    fontSize: 72,
    marginBottom: 20,
  },
  progressBar: {
    width: "100%",
    height: 10,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    marginVertical: 8,
  },
});
