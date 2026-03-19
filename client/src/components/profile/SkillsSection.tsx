import { Zap } from "lucide-react";

interface SkillsSectionProps {
    skills: string[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
    if (!skills || skills.length === 0) {
        return null;
    }

    return (
        <div className="bg-card border-3 border-lime shadow-brutal p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-white" />
                <h2 className="font-grotesk font-black text-white text-lg uppercase">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-3">
                {skills.map((skill, idx) => (
                    <div
                        key={idx}
                        className="bg-dark border-2 border-lime text-lime font-grotesk font-bold text-xs px-4 py-2 uppercase"
                    >
                        {skill}
                    </div>
                ))}
            </div>
        </div>
    );
}
