import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export const RegisterScreen = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();

  const handleRegister = async () => {
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // router.replace("/dashboard"); // Navigation handled by _layout.tsx
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Consider adding an app logo or icon here later */}
        <Text variant="headlineLarge" style={styles.title}>
          Create Account
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          mode="flat" // Use flat mode for a simpler look
          underlineColor={theme.colors.onSurfaceVariant} // Use a subtle underline color
          activeUnderlineColor={theme.colors.primary} // Use primary color when active
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          mode="flat" // Use flat mode for a simpler look
          underlineColor={theme.colors.onSurfaceVariant} // Use a subtle underline color
          activeUnderlineColor={theme.colors.primary} // Use primary color when active
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="flat" // Use flat mode for a simpler look
          underlineColor={theme.colors.onSurfaceVariant} // Use a subtle underline color
          activeUnderlineColor={theme.colors.primary} // Use primary color when active
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          disabled={loading}
        >
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => router.replace("/login")}
          style={[styles.button, styles.textButton]}
          labelStyle={[styles.buttonLabel, styles.textButtonLabel]}
        >
          Already have an account? Sign In
        </Button>
        {/* Removed Back to Welcome button */}
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
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent", // Ensure no background color for flat mode
  },
  button: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 16,
  },
  textButton: {
    marginTop: 8,
  },
  textButtonLabel: {
    fontSize: 14,
    color: "#555", // Darker grey for text button
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8, // Add margin top to separate from inputs
  },
});
