import { create } from "zustand";
import { api } from "../config/axios";

interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

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
  loading: false,
  error: null,
  isAuthenticated: false,

  // ✅ REGISTER
  register: async ({ name, email, password }) => {
    try {
      set({ loading: true, error: null });
      console.log(process.env.NEXT_PUBLIC_API_URL); // Debug log to check API URL
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
      });

      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      set({
        error: errorMessage,
        loading: false,
      });
      throw err;
    }
  },

  // ✅ LOGIN
  login: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
      });

      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      set({
        error: errorMessage,
        loading: false,
      });
      throw err;
    }
  },

  // ✅ GET USER
  getUser: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/api/auth/user");

      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err: any) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: err.response?.data?.message || "Failed to fetch user",
      });
    }
  },

  // ✅ LOGOUT
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));