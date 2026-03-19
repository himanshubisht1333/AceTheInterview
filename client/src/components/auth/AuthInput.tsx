import { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function AuthInput({
    label,
    error,
    icon,
    className = "",
    ...props
}: AuthInputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block font-grotesk font-bold text-white text-sm mb-2 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {icon && (
                    <div className="absolute left-3 text-lime pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full bg-dark border-3 border-white text-white placeholder-white/40 p-3 ${
                        icon ? "pl-10" : ""
                    } focus:border-lime focus:outline-none transition-colors font-inter ${
                        error ? "border-red-500" : ""
                    } ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-red-400 text-sm mt-1 font-inter">{error}</p>
            )}
        </div>
    );
}
