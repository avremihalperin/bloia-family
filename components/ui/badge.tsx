import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#c4a055]/30 bg-[#c4a055]/10 px-3 py-0.5 text-xs font-medium tracking-wide text-[#8b6914]",
        className
      )}
      {...props}
    />
  );
}
