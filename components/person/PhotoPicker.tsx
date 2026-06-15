"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/compress-image";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PhotoPickerProps {
  name: string;
  label?: string;
  currentPhoto?: string | null;
  onFileSelect: (file: File | null) => void;
  size?: "md" | "lg";
}

export function PhotoPicker({
  name,
  label = "תמונה",
  currentPhoto,
  onFileSelect,
  size = "lg",
}: PhotoPickerProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onFileSelect(null);
      return;
    }

    const compressed = await compressImage(file);
    onFileSelect(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#c4a055]/30 bg-[#c4a055]/5 p-5">
      <Avatar name={name} photoUrl={preview} size={size} />
      <div className="text-center">
        <Label htmlFor={`photo-${name}`}>{label}</Label>
        <input
          ref={inputRef}
          id={`photo-${name}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="mt-2 block w-full text-sm"
        />
      </div>
      {preview && (
        <Button type="button" variant="ghost" size="sm" onClick={() => {
          setPreview(null);
          onFileSelect(null);
          if (inputRef.current) inputRef.current.value = "";
        }}>
          הסר תמונה
        </Button>
      )}
    </div>
  );
}
