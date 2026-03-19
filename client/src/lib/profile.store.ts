import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Education {
    institution: string;
    degree: string;
    year: string;
    _id: string;
}

export interface Experience {
    company: string;
    role: string;
    duration: string;
    _id: string;
}

export interface ProfileData {
    _id: string;
    user: string;
    name: string;
    email: string;
    phone: string;
    education: Education[];
    experience: Experience[];
    skills: string[];
    resumeText: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileState {
    profile: ProfileData | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchProfile: (token: string) => Promise<void>;
    clearProfile: () => void;
    clearError: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            profile: null,
            loading: false,
            error: null,

            fetchProfile: async (token: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE_URL}/api/profile`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Failed to fetch profile");
                    }

                    set({
                        profile: data.data,
                        loading: false,
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "An error occurred";
                    set({ error: errorMessage, loading: false });
                    throw err;
                }
            },

            clearProfile: () => {
                set({
                    profile: null,
                    error: null,
                });
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: "profile-store",
            partialize: (state) => ({
                profile: state.profile,
            }),
        }
    )
);
