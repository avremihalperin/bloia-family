"use client";

import { compressImage } from "@/lib/compress-image";
import { useState } from "react";
import { uploadPhoto } from "@/app/actions/family";
import { Avatar } from "@/components/ui/avatar";
import { PhotoFileInput } from "@/components/person/PhotoFileInput";

interface PhotoUploadProps {
  personId: string;
  name: string;
  currentPhoto?: string | null;
}

export function PhotoUpload({ personId, name, currentPhoto }: PhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState(currentPhoto);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("photo", compressed, compressed.name);
      const url = await uploadPhoto(personId, formData);
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar name={name} photoUrl={photoUrl} size="lg" />
      <PhotoFileInput
        id={`photo-upload-${personId}`}
        label="תמונה אישית"
        onChange={handleChange}
        disabled={loading}
        buttonText={loading ? "מעלה..." : "העלה תמונה"}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
