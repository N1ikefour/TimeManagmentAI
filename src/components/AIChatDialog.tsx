import React, { useState } from "react";
import {
  Portal,
  Dialog,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { View, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { aiService } from "../services/aiService";
import { Task } from "../services/taskService";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface AIChatDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onTaskCreated: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void;
}

export const AIChatDialog: React.FC<AIChatDialogProps> = ({
  visible,
  onDismiss,
  onTaskCreated,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let response;
      if (
        input.toLowerCase().includes("analyze") ||
        input.toLowerCase().includes("analysis")
      ) {
        response = await aiService.analyzeTasks(user.id);
      } else {
        response = await aiService.getTaskSuggestions(user.id, input);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.task) {
        onTaskCreated(response.task);
      }
    } catch (error) {
      console.error("Error in AI chat:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>AI Assistant</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.messagesContainer}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser
                      ? styles.userMessageText
                      : styles.aiMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
              </View>
            )}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            style={styles.input}
            disabled={loading}
            onSubmitEditing={handleSend}
          />
          <Button
            onPress={handleSend}
            disabled={!input.trim() || loading}
            loading={loading}
          >
            Send
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: "80%",
  },
  messagesContainer: {
    maxHeight: 300,
  },
  messageContainer: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#e3f2fd",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#1976d2",
  },
  aiMessageText: {
    color: "#424242",
  },
  loadingContainer: {
    padding: 8,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
});
