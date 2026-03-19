"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BrutalistButton from "@/components/ui/BrutalistButton";
import GridBackground from "@/components/ui/GridBackground";
import AuthInput from "@/components/auth/AuthInput";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuthStore } from "@/lib/auth.store";

export default function LoginPage() {
    const router = useRouter();

    const {
        login,
        loading,
        error,
        clearError,
        isAuthenticated, // ✅ use isAuthenticated directly, not token
    } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/profile");
        }
    }, [isAuthenticated, router]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
        if (error) clearError(); // ✅ dismiss store error on input change
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
        if (error) clearError(); // ✅ dismiss store error on input change
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};

        if (!email)
            newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email))
            newErrors.email = "Please enter a valid email";

        if (!password)
            newErrors.password = "Password is required";
        else if (password.length < 6)
            newErrors.password = "Password must be at least 6 characters";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return; // ✅ early return

        try {
            // ✅ Pass object { email, password } matching store signature
            await login(email, password);
            // Redirect handled by useEffect watching isAuthenticated
        } catch (err) {
            // Error is set in the store; no extra handling needed here
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-dark mt-15">
            <Navbar />

            <GridBackground
                cellSize={48}
                lineOpacity={0.06}
                className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
            >
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime/5 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-grotesk font-black text-white mb-2">
                            WELCOME <br />
                            <span className="text-lime">BACK</span>
                        </h1>
                        <p className="text-white/60 text-sm">
                            Sign in to continue your interview journey
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-card border-3 border-lime shadow-brutal p-8 mb-6">
                        {/* Global store error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-red-500/10 border-2 border-red-500 text-red-400 text-sm flex justify-between items-center"
                            >
                                <span>{error}</span>
                                <button
                                    onClick={clearError}
                                    className="text-lg hover:text-red-300"
                                    aria-label="Dismiss error"
                                >
                                    ×
                                </button>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <AuthInput
                                label="Email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={handleEmailChange}
                                error={errors.email}
                                icon={<Mail className="w-5 h-5" />}
                            />

                            <AuthInput
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={handlePasswordChange}
                                error={errors.password}
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <BrutalistButton
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                block
                            >
                                <LogIn className="w-5 h-5" />
                                {loading ? "Signing in..." : "Sign In"}
                            </BrutalistButton>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="text-center space-y-4">
                        <p className="text-white/60 text-sm">
                            Don't have an account?{" "}
                            <Link
                                href="/auth/register"
                                className="text-lime font-bold hover:underline"
                            >
                                Create one
                            </Link>
                        </p>

                        <Link
                            href="/"
                            className="inline-block text-white/60 text-sm hover:text-lime transition-colors"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </motion.div>
            </GridBackground>
        </div>
    );
}