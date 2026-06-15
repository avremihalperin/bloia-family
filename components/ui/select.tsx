import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#c4a055]/25 bg-white/80 px-4 py-2 text-sm text-[#1a1714] shadow-sm transition-colors focus-visible:border-[#c4a055]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a055]/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
