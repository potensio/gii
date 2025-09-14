"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  signupFormSchema,
  resetPasswordFormSchema,
  LoginFormData,
  SignupFormData,
  ResetPasswordFormData,
  AuthUser,
  AuthResponse,
  AuthError
} from "@/lib/auth-schema";
import { toast } from "@/hooks/use-toast";

// Auth Context
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<AuthResponse>;
  signup: (data: SignupFormData) => Promise<AuthResponse>;
  logout: () => void;
  resetPassword: (data: ResetPasswordFormData) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // TODO: Validate token with API
          // For now, just simulate user data
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (data: LoginFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: AuthUser = {
        id: '1',
        email: data.email,
        nama: 'User Test',
        createdAt: new Date().toISOString()
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      // Store in localStorage
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      setUser(mockUser);
      
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${mockUser.nama}!`,
      });
      
      return {
        success: true,
        message: 'Login berhasil',
        user: mockUser,
        token: mockToken
      };
    } catch (error) {
      const errorMessage = 'Login gagal. Silakan coba lagi.';
      toast({
        title: "Login gagal",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful signup
      const mockUser: AuthUser = {
        id: '1',
        email: data.email,
        nama: data.nama,
        createdAt: new Date().toISOString()
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      setUser(mockUser);
      
      toast({
        title: "Registrasi berhasil",
        description: `Selamat datang, ${mockUser.nama}!`,
      });
      
      return {
        success: true,
        message: 'Registrasi berhasil',
        user: mockUser,
        token: mockToken
      };
    } catch (error) {
      const errorMessage = 'Registrasi gagal. Silakan coba lagi.';
      toast({
        title: "Registrasi gagal",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email reset password terkirim",
        description: `Link reset password telah dikirim ke ${data.email}`,
      });
      
      return {
        success: true,
        message: 'Email reset password berhasil dikirim'
      };
    } catch (error) {
      const errorMessage = 'Gagal mengirim email reset password.';
      toast({
        title: "Reset password gagal",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari akun.",
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook untuk menggunakan Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Form Hooks
export function useLoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  return {
    form,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    register: form.register,
    handleSubmit: form.handleSubmit,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues
  };
}

export function useSignupForm() {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      nama: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    }
  });

  return {
    form,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    register: form.register,
    handleSubmit: form.handleSubmit,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues
  };
}

export function useResetPasswordForm() {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: ''
    }
  });

  return {
    form,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    register: form.register,
    handleSubmit: form.handleSubmit,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues
  };
}