interface AvatarProps {
    name: string;
    size?: "sm" | "md" | "lg";
}

export default function Avatar({ name, size = "md" }: AvatarProps) {
    // Get initials from name
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-16 h-16 text-xl",
        lg: "w-24 h-24 text-3xl",
    };

    return (
        <div
            className={`${sizeClasses[size]} bg-lime text-dark font-grotesk font-black border-3 border-dark shadow-brutal-dark flex items-center justify-center`}
        >
            {initials}
        </div>
    );
}
