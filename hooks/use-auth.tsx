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
import { apiClient } from "@/lib/api-client";

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

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Try to get current user from /api/auth/me
      const response = await apiClient.get<{ user: AuthUser }>("/api/auth/me");
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginFormData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/login", data, { skipAuth: true });
      
      if (response.error) {
        return {
          success: false,
          message: response.error,
        };
      }

      const result = response.data!;
      if (result.success && result.user) {
        setUser(result.user);
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
      const response = await apiClient.post<AuthResponse>("/api/auth/signup", data, { skipAuth: true });
      
      if (response.error) {
        return {
          success: false,
          message: response.error,
        };
      }

      const result = response.data!;
      if (result.success && result.user) {
        setUser(result.user);
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

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user state regardless of API response
      setUser(null);
    }
  };

  const resetPassword = async (
    data: ResetPasswordFormData
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/reset-password", data, { skipAuth: true });
      
      if (response.error) {
        return {
          success: false,
          message: response.error,
        };
      }

      return response.data!;
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
      const response = await apiClient.post<{ user: AuthUser }>("/api/auth/refresh", undefined, { skipRefresh: true });
      
      if (response.data?.user) {
        setUser(response.data.user);
        return true;
      }

      // If refresh fails, clear auth state
      setUser(null);
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      setUser(null);
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
