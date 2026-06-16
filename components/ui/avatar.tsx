import type { Gender } from "@/lib/types";
import { genderAvatarClasses, genderAvatarPlaceholderClasses } from "@/lib/gender-colors";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  gender?: Gender | null;
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs ring-2",
  md: "h-12 w-12 text-sm ring-2",
  lg: "h-20 w-20 text-xl ring-[3px]",
};

export function Avatar({ name, photoUrl, size = "md", gender, className }: AvatarProps) {
  const dim = size === "sm" ? 32 : size === "md" ? 48 : 80;
  const ringClass = genderAvatarClasses(gender);

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
        "flex items-center justify-center rounded-full",
        genderAvatarPlaceholderClasses(gender),
        sizes[size],
        ringClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
