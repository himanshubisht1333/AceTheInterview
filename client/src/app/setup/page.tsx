"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import SetupCard from "@/components/setup/SetupCard";
import ResumeUpload from "@/components/setup/ResumeUpload";
import { Brain, Zap, ChevronDown, AlertCircle, PenLine } from "lucide-react";
import { roles } from "@/lib/roles";

export default function SetupPage() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [roleId, setRoleId] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const isCustomRole = roleId === "__custom__";
    const canProceed = resumeFile && roleId && (!isCustomRole || customRole.trim().length > 0);

    const handleSubmit = async () => {
        if (!resumeFile || !roleId) return;

        setError("");

        let finalRoleId: string;
        let finalPrompt: string;

        if (isCustomRole) {
            const trimmed = customRole.trim();
            if (!trimmed) {
                setError("Please enter a custom role name.");
                return;
            }
            finalRoleId = trimmed;
            finalPrompt = `Generate tailored interview questions for the role: ${trimmed}. 
Focus on role-specific technical skills, relevant soft skills, situational judgment, 
past experience, and motivation. Adapt the difficulty and topics to match what a 
hiring manager would typically ask for this position.Surely Greet with good morning`;
        } else {
            const selectedRole = roles.find(r => r.id === roleId);
            if (!selectedRole) {
                setError("Invalid role selected.");
                return;
            }
            finalRoleId = selectedRole.id;
            finalPrompt = selectedRole.promptTemplate;
        }

        try {
            setLoading(true);

            // Stage 1: Upload CV + generate questions
            setLoadingStage("Uploading resume & analysing with AI…");
            const formData = new FormData();
            formData.append("file", resumeFile);
            formData.append("role_id", finalRoleId);
            formData.append("prompt", finalPrompt);

            const response = await fetch("http://127.0.0.1:5000/cv", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                return;
            }

            // Stage 2: Poll until backend confirms questions are ready
            setLoadingStage(`Generated ${data.question_count} questions. Preparing interview…`);

            let ready = false;
            for (let i = 0; i < 15; i++) {
                await new Promise(r => setTimeout(r, 800));
                const statusRes = await fetch("http://127.0.0.1:5000/questions-status");
                const statusData = await statusRes.json();
                if (statusData.ready) { ready = true; break; }
            }

            if (!ready) {
                setError("Interview setup timed out. Please try again.");
                return;
            }

            // Navigate to interview page
            router.push("/interview");

        } catch (err) {
            console.error("Submission error:", err);
            setError("Network error. Is the backend running on port 5000?");
        } finally {
            setLoading(false);
            setLoadingStage("");
        }
    };

    return (
        <div className="min-h-screen bg-dark">
            <Navbar />
            <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="brutal-tag inline-block mb-3">
                        Setup · Step 1 of 2
                    </div>
                    <h1 className="text-4xl md:text-5xl font-grotesk font-black text-white">
                        PERSONALIZE YOUR <br />
                        <span className="text-lime">INTERVIEW</span>
                    </h1>
                </motion.div>

                <div className="space-y-6">

                    {/* Resume Upload */}
                    <SetupCard step={1} title="UPLOAD RESUME">
                        <ResumeUpload
                            file={resumeFile}
                            onFileChange={setResumeFile}
                        />
                    </SetupCard>

                    {/* Role Selection */}
                    <SetupCard step={2} title="TARGET ROLE">
                        <label className="text-white/50 text-xs block mb-2">
                            Target Role
                        </label>
                        <div className="relative">
                            <select
                                value={roleId}
                                onChange={(e) => {
                                    setRoleId(e.target.value);
                                    if (e.target.value !== "__custom__") setCustomRole("");
                                    setError("");
                                }}
                                className="w-full bg-dark border-3 border-dark-300 focus:border-lime text-white p-3 pr-10 outline-none"
                            >
                                <option value="">Select a role...</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                                <option value="__custom__">✏️ Custom Role…</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        </div>

                        {/* Custom role text input — slides in when "Custom Role" is selected */}
                        <AnimatePresence>
                            {isCustomRole && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                    className="overflow-hidden"
                                >
                                    <label className="text-white/50 text-xs block mb-2">
                                        Enter Your Role
                                    </label>
                                    <div className="relative">
                                        <PenLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime/60 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={customRole}
                                            onChange={(e) => {
                                                setCustomRole(e.target.value);
                                                setError("");
                                            }}
                                            placeholder="e.g. DevOps Engineer, Product Manager, UX Researcher…"
                                            maxLength={80}
                                            className="w-full bg-dark border-3 border-lime/40 focus:border-lime text-white placeholder-white/25 p-3 pl-10 pr-16 outline-none font-mono text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 text-xs pointer-events-none">
                                            {customRole.length}/80
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-xs mt-1.5">
                                        Gemini will tailor questions specifically for this role.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SetupCard>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Loading stage indicator */}
                    <AnimatePresence>
                        {loading && loadingStage && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 bg-lime/10 border border-lime/30 text-lime px-4 py-3 rounded text-sm"
                            >
                                <motion.div
                                    className="w-4 h-4 rounded-full border-2 border-lime border-t-transparent shrink-0"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                />
                                {loadingStage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed || loading}
                            className={`w-full flex items-center justify-center gap-3 font-black text-lg py-5 uppercase border-3 transition-all ${
                                canProceed && !loading
                                    ? "bg-lime text-dark border-dark hover:translate-x-1 hover:translate-y-1"
                                    : "bg-dark-200 text-white/30 border-dark-300 cursor-not-allowed"
                            }`}
                        >
                            {loading ? "Processing…" : "Generate Interview Plan"}
                            {!loading && <Brain className="w-6 h-6" />}
                            {!loading && <Zap className="w-5 h-5" />}
                        </button>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}