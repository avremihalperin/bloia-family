"use client";

import { useState } from "react";
import { compressImage } from "@/lib/compress-image";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhotoFileInput } from "@/components/person/PhotoFileInput";

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
  const [resetKey, setResetKey] = useState(0);

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

  const clearPhoto = () => {
    setPreview(null);
    onFileSelect(null);
    setResetKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#c4a055]/30 bg-[#c4a055]/5 p-5">
      <Avatar name={name} photoUrl={preview} size={size} />
      <PhotoFileInput
        key={resetKey}
        id={`photo-${name}`}
        label={label}
        onChange={handleChange}
        buttonText="העלה תמונה"
      />
      {preview && (
        <Button type="button" variant="ghost" size="sm" onClick={clearPhoto}>
          הסר תמונה
        </Button>
      )}
    </div>
  );
}
