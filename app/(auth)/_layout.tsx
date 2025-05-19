import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="focus" />
    </Stack>
  );
}
