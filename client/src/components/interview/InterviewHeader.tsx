"use client";

import { Brain, Clock, ChevronRight } from "lucide-react";

interface InterviewHeaderProps {
    elapsed: number;
    onEnd?: () => void; // called by END & GET FEEDBACK button
}

function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export default function InterviewHeader({
    elapsed,
    onEnd,
}: InterviewHeaderProps) {
    return (
        <div className="bg-dark border-b-3 border-lime px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-lime border-3 border-dark flex items-center justify-center">
                    <Brain className="w-4 h-4 text-dark" />
                </div>
                <div>
                    <div className="font-grotesk font-black text-white text-sm">AceTheInterview — LIVE SESSION</div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Timer */}
                <div className="flex items-center gap-2 bg-card border-3 border-dark-300 px-3 py-1">
                    <Clock className="w-3 h-3 text-lime" />
                    <span className="font-grotesk font-bold text-white text-sm">{formatTime(elapsed)}</span>
                </div>

                {/* END button — calls onEnd which triggers /evaluate then redirects */}
                <button
                    onClick={onEnd}
                    className="brutal-btn-primary text-xs px-4 py-2 flex items-center gap-1"
                >
                    End & Get Feedback
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}