"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadBranchPhoto } from "@/app/actions/family";
import { compressImage } from "@/lib/compress-image";
import { PhotoFileInput } from "@/components/person/PhotoFileInput";

interface BranchPhotoUploadProps {
  branchId: string;
  label: string;
  currentPhoto?: string | null;
}

export function BranchPhotoUpload({
  branchId,
  label,
  currentPhoto,
}: BranchPhotoUploadProps) {
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
      const url = await uploadBranchPhoto(branchId, formData);
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#c4a055]/20 bg-white/60 p-5">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={`תמונה משפחתית — ${label}`}
          width={160}
          height={120}
          className="h-28 w-40 rounded-lg object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-28 w-40 items-center justify-center rounded-lg bg-amber-50 text-sm text-stone-500">
          אין תמונה
        </div>
      )}
      <div className="text-center">
        <p className="font-medium">{label}</p>
        <PhotoFileInput
          id={`branch-photo-${branchId}`}
          label="תמונה משפחתית"
          onChange={handleChange}
          disabled={loading}
          buttonText={loading ? "מעלה..." : "העלה תמונה משפחתית"}
          className="mt-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
