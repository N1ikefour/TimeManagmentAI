import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Добавляем подробный отладочный вывод
console.log("Environment variables check:");
console.log("EXPO_PUBLIC_SUPABASE_URL:", supabaseUrl);
console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY length:", supabaseAnonKey?.length);
console.log(
  "EXPO_PUBLIC_SUPABASE_ANON_KEY first 4 chars:",
  supabaseAnonKey?.substring(0, 4)
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

const storage = Platform.OS === "web" ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Проверка подключения
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Error connecting to Supabase:", error);
  } else {
    console.log("Successfully connected to Supabase");
  }
});
