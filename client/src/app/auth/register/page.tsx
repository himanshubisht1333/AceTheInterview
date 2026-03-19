"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BrutalistButton from "@/components/ui/BrutalistButton";
import GridBackground from "@/components/ui/GridBackground";
import AuthInput from "@/components/auth/AuthInput";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useAuthStore } from "@/lib/auth.store";

export default function RegisterPage() {
    const router = useRouter();

    const {
        register,
        loading,
        error,
        clearError,
        isAuthenticated, // ✅ use isAuthenticated, not token
    } = useAuthStore();

    const [formData, setFormData] = useState({
        name: "",          // ✅ renamed from fullName → name (matches store)
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/profile");
        }
    }, [isAuthenticated, router]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        // Also clear global store error when user starts typing
        if (error) clearError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};

        // Client-side validation
        if (!formData.name.trim())
            newErrors.name = "Full name is required";

        if (!formData.email)
            newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Please enter a valid email";

        if (!formData.password)
            newErrors.password = "Password is required";
        else if (formData.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";

        if (!formData.confirmPassword)
            newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        try {
            // ✅ Pass object { name, email, password } matching store signature  
            // thts dumb 
            await register(
                formData.name.trim(),
                formData.email,
                formData.password
            );
            // Redirect handled by useEffect watching isAuthenticated
        } catch (err) {
            // Error is set in the store; no extra handling needed here
            console.error("Registration failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-dark mt-10">
            <Navbar />

            <GridBackground
                cellSize={48}
                lineOpacity={0.06}
                className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden py-8"
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
                            CREATE <br />
                            <span className="text-lime">ACCOUNT</span>
                        </h1>
                        <p className="text-white/60 text-sm font-inter">
                            Join thousands cracking interviews with AI
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

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            {/* ✅ field key is now "name" */}
                            <AuthInput
                                label="Full Name"
                                type="text"
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                error={errors.name}
                                icon={<User className="w-5 h-5" />}
                            />

                            <AuthInput
                                label="Email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                error={errors.email}
                                icon={<Mail className="w-5 h-5" />}
                            />

                            <AuthInput
                                label="Password"
                                type="password"
                                placeholder="Create a password (min. 6 chars)"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                error={errors.password}
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <AuthInput
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    handleChange("confirmPassword", e.target.value)
                                }
                                error={errors.confirmPassword}
                                icon={<Lock className="w-5 h-5" />}
                            />

                            <BrutalistButton
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                block
                            >
                                <UserPlus className="w-5 h-5" />
                                {loading ? "Creating account..." : "Create Account"}
                            </BrutalistButton>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="text-center space-y-4">
                        <p className="text-white/60 text-sm">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="text-lime font-bold hover:underline"
                            >
                                Sign in
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