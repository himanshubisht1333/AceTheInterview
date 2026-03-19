import { create } from "zustand";
import axiosInstance from "@/config/axios";

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;

  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<any>;

  login: (data: {
    email: string;
    password: string;
  }) => Promise<any>;

  getUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("auth-store")
      : null,
  loading: false,
  error: null,

  // ✅ REGISTER (FIXED)
  register: async ({ name, email, password }) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.post("/api/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });

      return res.data;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Register failed",
        loading: false,
      });
    }
  },

  // LOGIN
  login: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });

      return res.data;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
    }
  },

  // GET USER
  getUser: async () => {
    try {
      const res = await axiosInstance.get("/api/auth/getUser");

      set({
        user: res.data.user,
      });
    } catch {
      set({
        user: null,
        token: null,
      });
      localStorage.removeItem("auth-store");
    }
  },

  logout: () => {
    localStorage.removeItem("auth-store");
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));