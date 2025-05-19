import React, { createContext, useState, useContext, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Initializing...");
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        "AuthProvider: Initial session check:",
        session ? "Session exists" : "No session"
      );
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "AuthProvider: Auth state changed:",
        event,
        session ? "Session exists" : "No session"
      );
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign up for:", email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("AuthProvider: Sign up error:", error);
      throw error;
    }
    console.log("AuthProvider: Sign up successful");
  };

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign in for:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("AuthProvider: Sign in error:", error);
      throw error;
    }
    console.log("AuthProvider: Sign in successful");
  };

  const logout = async () => {
    console.log("AuthProvider: Attempting logout");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("AuthProvider: Logout error:", error);
      throw error;
    }
    console.log("AuthProvider: Logout successful");
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
