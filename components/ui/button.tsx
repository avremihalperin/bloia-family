import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

const variants = {
  default: "bg-amber-700 text-white hover:bg-amber-800",
  outline: "border border-amber-300 bg-white hover:bg-amber-50",
  ghost: "hover:bg-amber-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-sm",
  lg: "h-12 rounded-lg px-6 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
