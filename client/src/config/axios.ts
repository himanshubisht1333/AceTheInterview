import axios from "axios";
import { useAuthStore } from "@/lib/auth.store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://10.30.57.64:8000";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // optional (if cookies used later)
});

/**
 * REQUEST INTERCEPTOR
 */
axiosInstance.interceptors.request.use(
  (config) => {
    let token;

    // ✅ Safe check for browser (Next.js fix)
    if (typeof window !== "undefined") {
      token =
        useAuthStore.getState().token ||
        localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ✅ Avoid crashing on SSR
    const isBrowser = typeof window !== "undefined";

    if (status === 401) {
      // Token expired / invalid
      useAuthStore.getState().logout();

      if (isBrowser) {
        window.location.href = "/auth/login";
      }
    }

    if (status === 403) {
      console.warn("🚫 Forbidden: You don’t have permission.");
    }

    if (status >= 500) {
      console.error("🔥 Server error:", status);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;