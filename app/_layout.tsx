import { Stack, useRouter, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isWelcomeScreen = segments[0] === "welcome";
    const isLoginScreen = segments[0] === "login";
    const isRegisterScreen = segments[0] === "register";
    const isFocusScreen = segments[0] === "focus";

    if (
      !user &&
      !inAuthGroup &&
      !isWelcomeScreen &&
      !isLoginScreen &&
      !isRegisterScreen &&
      !isFocusScreen
    ) {
      // Перенаправляем на экран приветствия, если пользователь не аутентифицирован
      router.replace("/welcome");
    } else if (user && (isWelcomeScreen || isLoginScreen || isRegisterScreen)) {
      // Перенаправляем на главный экран только если пользователь на экранах входа/регистрации
      router.replace("/dashboard");
    }
  }, [user, loading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="focus" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </PaperProvider>
  );
}
