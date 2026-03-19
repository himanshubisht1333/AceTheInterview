import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    // Actions
    register: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    getUser: () => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            loading: false,
            error: null,
            isAuthenticated: false,

            register: async (name: string, email: string, password: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ name, email, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Registration failed");
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "An error occurred";
                    set({ error: errorMessage, loading: false });
                    throw err;
                }
            },

            login: async (email: string, password: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Login failed");
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "An error occurred";
                    set({ error: errorMessage, loading: false });
                    throw err;
                }
            },

            getUser: async () => {
                set({ loading: true, error: null });
                try {
                    const token = get().token;
                    if (!token) {
                        throw new Error("No token found");
                    }

                    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Failed to fetch user");
                    }

                    set({
                        user: data.user,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "An error occurred";
                    set({ error: errorMessage, loading: false });
                    throw err;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: "auth-store",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
