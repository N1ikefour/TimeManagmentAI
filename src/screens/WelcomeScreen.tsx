import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Button, Text } from "react-native-paper";
import { router } from "expo-router";

export const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>
          Focus App
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Boost your productivity with AI-powered task management
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.push("/login")}
            style={styles.button}
          >
            Login
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/register")}
            style={styles.button}
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
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.7,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    marginVertical: 8,
  },
});
