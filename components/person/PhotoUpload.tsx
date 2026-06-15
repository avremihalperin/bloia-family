"use client";

import imageCompression from "browser-image-compression";
import { useState } from "react";
import { uploadPhoto } from "@/app/actions/family";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });

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
      <div>
        <Label htmlFor="photo">תמונה</Label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          disabled={loading}
          className="mt-1 block text-sm"
        />
      </div>
      {loading && <p className="text-sm text-stone-500">מעלה...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="button" variant="ghost" size="sm" disabled>
        {photoUrl ? "תמונה הועלתה" : "בחר תמונה"}
      </Button>
    </div>
  );
}
