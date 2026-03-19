
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X, Zap } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "For Who", href: "#targets" },
    { label: "Dashboard", href: "/setup" },
    { label: "Community", href: "/community" },
];

export default function Navbar() {
    // ✅ Use isAuthenticated from the store — single source of truth
    const { isAuthenticated, logout, user, getUser } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        getUser();
        console.log(user);
    }, [getUser, user])

    // ✅ Removed the localStorage useEffect — no longer needed.
    // isAuthenticated from Zustand is the authoritative auth signal.

    const handleLogOut = async () => {
        await logout();
        setMobileOpen(false); // close menu on mobile before redirecting
        router.push("/auth/login");
    };

    console.log(user);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-dark border-b-3 border-lime"
                    : "bg-transparent border-b-3 border-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-lime border-3 border-dark flex items-center justify-center shadow-brutal-dark group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-150">
                            <Brain className="w-5 h-5 text-dark" />
                        </div>
                        <span className="font-grotesk font-bold text-xl text-white">
                            AceThe<span className="text-lime">Interview</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-sm font-grotesk font-medium text-white/70 hover:text-lime transition-colors duration-200 uppercase tracking-wide"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* ✅ Conditionally render based on isAuthenticated from store */}
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="text-sm font-grotesk font-bold text-white/70 hover:text-lime transition-colors duration-200 uppercase tracking-wide px-4 py-2"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogOut}
                                    className="text-sm font-grotesk font-bold text-white/70 hover:text-lime transition-colors duration-200 uppercase tracking-wide px-4 py-2"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="text-sm font-grotesk font-bold text-white/70 hover:text-lime transition-colors duration-200 uppercase tracking-wide px-4 py-2"
                            >
                                Sign In
                            </Link>
                        )}

                        <Link
                            href="/setup"
                            className="brutal-btn-primary text-sm px-5 py-2 flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            Start Free
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-white border-3 border-white p-2"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-dark border-b-3 border-lime"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block text-sm font-grotesk font-bold text-white uppercase tracking-wide py-2 border-b border-dark-200"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* ✅ Same isAuthenticated check for mobile menu */}
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileOpen(false)}
                                        className="block text-sm font-grotesk font-bold text-white uppercase tracking-wide py-2 border-b border-dark-200"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogOut}
                                        className="block w-full text-left text-sm font-grotesk font-bold text-white uppercase tracking-wide py-2 border-b border-dark-200"
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block text-sm font-grotesk font-bold text-white uppercase tracking-wide py-2 border-b border-dark-200"
                                >
                                    Sign In
                                </Link>
                            )}

                            <Link
                                href="/setup"
                                className="brutal-btn-primary w-full text-center block mt-4"
                            >
                                Start Free
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}