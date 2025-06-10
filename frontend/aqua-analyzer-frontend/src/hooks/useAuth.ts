// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { LoginFormData, User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem("aqua_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, this would call your API
      const mockUser: User = {
        userId: credentials.userId,
        name: "Demo User",
        role: "admin",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("aqua_user", JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("aqua_user");
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
