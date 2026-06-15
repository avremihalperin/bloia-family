import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs ring-2",
  md: "h-12 w-12 text-sm ring-2",
  lg: "h-20 w-20 text-xl ring-[3px]",
};

export function Avatar({ name, photoUrl, size = "md", className }: AvatarProps) {
  const dim = size === "sm" ? 32 : size === "md" ? 48 : 80;
  const ringClass = "ring-[#c4a055]/40";

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={dim}
        height={dim}
        className={cn("rounded-full object-cover shadow-sm", sizes[size], ringClass, className)}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-[#e8d5a3] to-[#c4a055] font-semibold text-[#1a1714] shadow-sm",
        sizes[size],
        ringClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
