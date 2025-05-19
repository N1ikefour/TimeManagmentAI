import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Dialog, Portal, TextInput, Button, Text } from "react-native-paper";
import { Task } from "../services/taskService";

interface AIChatDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onTaskCreated: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void;
}

export const AIChatDialog = ({
  visible,
  onDismiss,
  onTaskCreated,
}: AIChatDialogProps) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      // TODO: Здесь будет интеграция с AI
      // Временная заглушка для демонстрации
      const task = {
        title: message,
        description: "Created via AI chat",
        priority: 1,
        deadline: new Date().toISOString(),
        user_id: "", // Будет установлено в родительском компоненте
        completed: false,
      };

      onTaskCreated(task);
      setMessage("");
      onDismiss();
    } catch (error) {
      console.error("AI chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>AI Assistant</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.hint}>
            Describe your task in natural language. For example: "I need to
            prepare a presentation for tomorrow's meeting"
          </Text>
          <TextInput
            label="Your message"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !message.trim()}
          >
            Create Task
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  hint: {
    marginBottom: 16,
    color: "#666",
  },
  input: {
    marginBottom: 8,
  },
});
