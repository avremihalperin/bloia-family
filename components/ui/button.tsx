import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

const variants = {
  default:
    "bg-gradient-to-l from-[#8b6914] to-[#c4a055] text-white shadow-md shadow-[#8b6914]/20 hover:from-[#7a5a12] hover:to-[#b8924a] hover:shadow-lg",
  outline:
    "border border-[#c4a055]/40 bg-white/60 text-[#1a1714] hover:border-[#c4a055] hover:bg-[#faf7f2]",
  ghost: "text-[#1a1714] hover:bg-[#c4a055]/10",
  destructive: "bg-red-700 text-white hover:bg-red-800 shadow-sm",
};

const sizes = {
  default: "h-10 px-5 py-2",
  sm: "h-8 rounded-lg px-3.5 text-sm",
  lg: "h-12 rounded-xl px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
