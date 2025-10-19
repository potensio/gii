"use client  ";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { RegisterFormInput } from "@/lib/validations/auth.validation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RegisterResponse {
  success: boolean;
  message: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      role: string;
      isVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  } | null;
}

const authApi = {
  logout: async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Terjadi kesalahan saat logout");
    }

    return response.json();
  },

  register: async (data: RegisterFormInput): Promise<RegisterResponse> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Terjadi kesalahan saat mendaftar");
    }

    return response.json();
  },

  verify: async (type: string, code: string): Promise<VerifyResponse> => {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, code }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Terjadi kesalahan saat memverifikasi"
      );
    }

    return response.json();
  },
};

export const useLogout = () => {
  // Define router
  const router = useRouter();
  // Logout mutation
  const mutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data) => {
      // Show success toast
      toast.success(data.message);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
  };
};

export const useRegister = () => {
  // State
  const [emailSent, setEmailSent] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");

  // Register mutation
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data, variables) => {
      // Show success toast
      toast.success(data.message);
      // Set email sent state
      setEmailSent(true);
      setEnteredEmail(variables.email);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
    emailSent,
    enteredEmail,
  };
};

export const useVerify = (type: string, code: string) => {
  // Define router
  const router = useRouter();
  // Verify mutation
  const mutation = useMutation({
    mutationFn: () => authApi.verify(type, code),
    onSuccess: (data) => {
      // Show success toast
      toast.success(data.message);
      // Redirect to login page
      router.push("/");
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
  };
};
