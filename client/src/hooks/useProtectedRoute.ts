import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth.store";

/**
 * Hook to protect routes that require authentication
 * Redirects unauthenticated users to login
 */
export function useProtectedRoute() {
    const router = useRouter();
    const { isAuthenticated, loading, token } = useAuthStore();

    useEffect(() => {
        if (!loading && (!isAuthenticated || !token)) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, loading, token, router]);

    return { isAuthenticated, loading };
}
