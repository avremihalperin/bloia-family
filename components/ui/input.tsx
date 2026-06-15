import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#c4a055]/25 bg-white/80 px-4 py-2 text-sm text-[#1a1714] shadow-sm transition-colors placeholder:text-stone-400 focus-visible:border-[#c4a055]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a055]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
