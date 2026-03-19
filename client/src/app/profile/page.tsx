"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import GridBackground from "@/components/ui/GridBackground";
import Avatar from "@/components/profile/Avatar";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { Mail, Phone, MapPin, Edit3, LogOut, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth.store";
import { useProfileStore } from "@/lib/profile.store";
import { mockProfileData } from "@/lib/mock-profile";
import { ProfileData } from "@/lib/profile.store";

export default function ProfilePage() {
    const router = useRouter();
    const { user, token, isAuthenticated, logout } = useAuthStore();
    const { profile, loading, error, fetchProfile, clearProfile } = useProfileStore();
    const [displayProfile, setDisplayProfile] = useState<ProfileData | null>(null);
    const [isMockData, setIsMockData] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            router.push("/auth/login");
            return;
        }

        // Fetch profile on mount
        fetchProfile(token)
            .then(() => {
                // Profile loaded successfully
            })
            .catch((err) => {
                console.error("Failed to fetch profile, using mock data:", err);
                // Use mock data as fallback
                setDisplayProfile(mockProfileData);
                setIsMockData(true);
            });
    }, [isAuthenticated, token, fetchProfile, router]);

    // Update display profile when actual profile is fetched
    useEffect(() => {
        if (profile) {
            setDisplayProfile(profile);
            setIsMockData(false);
        }
    }, [profile]);

    const handleLogout = () => {
        clearProfile();
        logout();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark">
                <Navbar />
                <GridBackground cellSize={48} lineOpacity={0.06} className="relative min-h-screen flex flex-col items-center justify-center px-4">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 border-3 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white/60 font-grotesk">Loading your profile...</p>
                    </motion.div>
                </GridBackground>
            </div>
        );
    }

    if (!displayProfile) {
        return (
            <div className="min-h-screen bg-dark">
                <Navbar />
                <GridBackground cellSize={48} lineOpacity={0.06} className="relative min-h-screen flex flex-col items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md"
                    >
                        <h1 className="text-3xl font-grotesk font-black text-white mb-4">Profile Not Found</h1>
                        <p className="text-white/60 mb-6">{error || "Unable to load your profile."}</p>
                        <Link href="/" className="text-lime hover:underline">
                            ← Back to home
                        </Link>
                    </motion.div>
                </GridBackground>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark">
            <Navbar />
            <GridBackground cellSize={48} lineOpacity={0.06} className="relative px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Mock Data Banner */}
                    {isMockData && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 bg-blue-500/10 border-2 border-blue-500 p-4 flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-grotesk font-bold text-blue-400 text-sm">Demo Profile</p>
                                <p className="text-blue-400/70 text-xs font-inter">
                                    This is a demo profile. Complete your actual profile setup to see your real data.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-card border-3 border-lime shadow-brutal p-8 mb-6"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-6">
                                <Avatar name={displayProfile.name} size="lg" />
                                <div>
                                    <h1 className="text-4xl font-grotesk font-black text-white mb-2">
                                        {displayProfile.name}
                                    </h1>
                                    <p className="text-white/60 font-inter text-sm mb-4">Full Stack Developer</p>

                                    {/* Contact Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Mail className="w-4 h-4 text-lime" />
                                            <span className="font-inter">{displayProfile.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Phone className="w-4 h-4 text-lime" />
                                            <span className="font-inter">{displayProfile.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 w-full sm:w-auto">
                                <BrutalistButton variant="outline" disabled block={true}>
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </BrutalistButton>
                                <button
                                    onClick={handleLogout}
                                    className="brutal-btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Sections */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {/* Education */}
                        <EducationSection education={displayProfile.education} />

                        {/* Experience */}
                        <ExperienceSection experience={displayProfile.experience} />

                        {/* Skills */}
                        <SkillsSection skills={displayProfile.skills} />

                        {/* Resume Preview */}
                        {displayProfile.resumeText && (
                            <div className="bg-card border-3 border-white shadow-brutal-white p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-4 h-4 bg-lime border-2 border-dark" />
                                    <h2 className="font-grotesk font-black text-white uppercase">Resume</h2>
                                </div>
                                <div className="bg-dark p-4 border-2 border-white/20 rounded text-white/70 text-xs font-inter whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {displayProfile.resumeText}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Footer Navigation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-center"
                    >
                        <Link href="/setup" className="text-lime hover:underline font-grotesk">
                            Ready to practice? Start an interview →
                        </Link>
                    </motion.div>
                </div>
            </GridBackground>
        </div>
    );
}
