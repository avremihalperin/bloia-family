"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PhotoFileInputProps {
  id: string;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  buttonText?: string;
  className?: string;
}

export function PhotoFileInput({
  id,
  label,
  onChange,
  disabled,
  buttonText = "בחר תמונה",
  className,
}: PhotoFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("text-center", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText}
      </button>
    </div>
  );
}
