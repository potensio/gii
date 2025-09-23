"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  signupFormSchema,
  resetPasswordFormSchema,
  newPasswordFormSchema,
  type LoginFormData,
  type SignupFormData,
  type ResetPasswordFormData,
  type NewPasswordFormData,
  type AuthUser,
  type AuthResponse,
} from "@/lib/schemas/auth-schema";

// Auth context types
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<AuthResponse>;
  signup: (data: SignupFormData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordFormData) => Promise<AuthResponse>;
  refreshToken: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const isAuthenticated = !!user && !!accessToken;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (accessToken) {
      // Set up token refresh interval (refresh every 10 minutes)
      const interval = setInterval(() => {
        refreshToken();
      }, 10 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const initializeAuth = async () => {
    try {
      // Try to refresh token on app start
      const success = await refreshToken();
      if (!success) {
        // If refresh fails, try to get current user with existing token
        const token = localStorage.getItem("accessToken");
        if (token) {
          setAccessToken(token);
          await getCurrentUser(token);
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          return true;
        }
      }

      // If getting user fails, clear token
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      return false;
    } catch (error) {
      console.error("Get current user error:", error);
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      return false;
    }
  };

  const login = async (data: LoginFormData): Promise<AuthResponse> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user && result.accessToken) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        localStorage.setItem("accessToken", result.accessToken);
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat login",
      };
    }
  };

  const signup = async (data: SignupFormData): Promise<AuthResponse> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user && result.accessToken) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        localStorage.setItem("accessToken", result.accessToken);
      }

      return result;
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mendaftar",
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side session
      if (accessToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear client-side state regardless of API call result
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
    }
  };

  const resetPassword = async (
    data: ResetPasswordFormData
  ): Promise<AuthResponse> => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat reset password",
      };
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user && result.accessToken) {
          setUser(result.user);
          setAccessToken(result.accessToken);
          localStorage.setItem("accessToken", result.accessToken);
          return true;
        }
      }

      // If refresh fails, clear auth state
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Form hooks with validation
export function useLoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit,
    register: form.register,
  };
}

export function useSignupForm() {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit,
    register: form.register,
  };
}

export function useResetPasswordForm() {
  return useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });
}

export function useNewPasswordForm() {
  return useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
}
