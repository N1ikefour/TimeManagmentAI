import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { router } from "expo-router";

export const WelcomeScreen = () => {
  const theme = useTheme();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Consider adding an app logo or icon here later */}
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to Focus App
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Boost your productivity and manage your tasks with smart tools.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.push("/login")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Login
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/register")}
            style={[styles.button, styles.outlineButton]}
            labelStyle={[styles.buttonLabel, styles.outlineButtonLabel]}
          >
            Register
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Keep background white
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: 40,
    textAlign: "center",
    color: "#555", // Slightly darker grey
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8, // Slightly rounded corners
    paddingVertical: 4, // Add some vertical padding
  },
  buttonLabel: {
    fontSize: 16,
  },
  outlineButton: {
    borderColor: "#ddd", // Light grey border for outlined button
  },
  outlineButtonLabel: {
    color: "#555", // Darker grey text for outlined button
  },
});
