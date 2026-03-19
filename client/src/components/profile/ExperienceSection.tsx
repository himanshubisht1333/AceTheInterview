import { Experience } from "@/lib/profile.store";
import { Briefcase } from "lucide-react";

interface ExperienceSectionProps {
    experience: Experience[];
}

export default function ExperienceSection({ experience }: ExperienceSectionProps) {
    if (!experience || experience.length === 0) {
        return null;
    }

    return (
        <div className="bg-card border-3 border-white shadow-brutal-white p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-lime" />
                <h2 className="font-grotesk font-black text-white text-lg uppercase">Experience</h2>
            </div>
            <div className="space-y-4">
                {experience.map((exp) => (
                    <div key={exp._id} className="border-l-3 border-lime pl-4">
                        <h3 className="font-grotesk font-bold text-white text-sm uppercase">
                            {exp.role}
                        </h3>
                        <p className="text-white/80 text-sm font-inter">{exp.company}</p>
                        <p className="text-lime text-xs font-grotesk uppercase mt-1">{exp.duration}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
