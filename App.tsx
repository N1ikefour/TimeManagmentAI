import React from "react";
import { PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";
import { TaskProvider } from "./src/context/TaskContext";

export default function App() {
  return (
    <PaperProvider>
      <TaskProvider>
        <AppNavigator />
      </TaskProvider>
    </PaperProvider>
  );
}
