import Image from "next/image";
import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  sm: { px: 40, className: "h-10 w-10 rounded-full" },
  md: { px: 56, className: "h-14 w-14 rounded-full" },
  lg: { px: 176, className: "h-44 w-44 rounded-full" },
};

export function BrandLogo({
  size = "md",
  href = "/",
  className,
  priority = false,
}: BrandLogoProps) {
  const s = sizeMap[size];
  const image = (
    <Image
      src="/logo.png"
      alt={`${APP_NAME} — ${APP_TAGLINE}`}
      width={s.px}
      height={s.px}
      className={cn("object-cover overflow-hidden", s.className, className)}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {image}
      </Link>
    );
  }

  return image;
}

interface BrandLogoHeroProps {
  subtitle?: string;
}

export function BrandLogoHero({ subtitle }: BrandLogoHeroProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <BrandLogo size="lg" href={null} priority className="shadow-lg shadow-black/20" />
      <h1 className="font-display mt-5 text-3xl font-bold tracking-tight text-[#e8d5a3]">
        {APP_NAME}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-stone-400">{subtitle}</p>}
    </div>
  );
}

interface BrandLogoNavProps {
  treeName: string;
}

export function BrandLogoNav({ treeName }: BrandLogoNavProps) {
  return (
    <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
      <BrandLogo size="sm" href={null} />
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-[#e8d5a3]">
          {APP_NAME}
        </h1>
        <p className="text-sm font-medium text-[#c4a055]/90">{treeName}</p>
        <p className="text-xs tracking-wide text-stone-400">{APP_TAGLINE}</p>
      </div>
    </Link>
  );
}
