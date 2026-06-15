import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
};

export function Avatar({ name, photoUrl, size = "md", className }: AvatarProps) {
  const dim = size === "sm" ? 32 : size === "md" ? 48 : 80;

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={dim}
        height={dim}
        className={cn("rounded-full object-cover", sizes[size], className)}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-amber-200 font-semibold text-amber-900",
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
