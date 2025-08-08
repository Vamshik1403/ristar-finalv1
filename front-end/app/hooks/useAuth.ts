// hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type UserType = "HOD" | "MANAGER" | "EXECUTIVE" | "SUPERADMIN";

interface LoginResponse {
  access_token: string;
  userId: number;
  userType: UserType;
  message: string;
}

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const router = useRouter();

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Invalid credentials");
      }

      const data: LoginResponse = await res.json();

      if (isTokenExpired(data.access_token)) {
        throw new Error("Token expired.");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("userType", data.userType);

      setUserId(data.userId);
      setUserType(data.userType);
      toast.success("Login successful!");

      return true;
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUserId(null);
    setUserType(null);
    router.push("/login");
    toast.info("Logged out.");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedId = localStorage.getItem("userId");
    const storedType = localStorage.getItem("userType");

    if (!token || isTokenExpired(token)) {
      logout();
    } else {
      setUserId(Number(storedId));
      setUserType(storedType as UserType);
    }
  }, []);

  return { login, logout, userId, userType };
};
