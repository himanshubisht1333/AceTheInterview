import { Education } from "@/lib/profile.store";
import { GraduationCap } from "lucide-react";

interface EducationSectionProps {
    education: Education[];
}

export default function EducationSection({ education }: EducationSectionProps) {
    if (!education || education.length === 0) {
        return null;
    }

    return (
        <div className="bg-card border-3 border-white shadow-brutal-white p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-5 h-5 text-lime" />
                <h2 className="font-grotesk font-black text-white text-lg uppercase">Education</h2>
            </div>
            <div className="space-y-4">
                {education.map((edu) => (
                    <div key={edu._id} className="border-l-3 border-lime pl-4">
                        <h3 className="font-grotesk font-bold text-white text-sm uppercase">
                            {edu.degree}
                        </h3>
                        <p className="text-white/80 text-sm font-inter">{edu.institution}</p>
                        <p className="text-lime text-xs font-grotesk uppercase mt-1">{edu.year}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
