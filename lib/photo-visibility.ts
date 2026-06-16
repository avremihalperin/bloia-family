import type { Gender } from "@/lib/types";
import { getAge } from "@/lib/honorifics";

const FEMALE_PHOTO_AGE_THRESHOLD = 6;

/** האם להציג תמונה אישית (ברירת מחדל: מסתיר נשים מעל גיל 6) */
export function shouldShowPersonPhoto(
  gender: Gender | null | undefined,
  birthDateGregorian: string | null | undefined,
  showWomenPhotos: boolean
): boolean {
  if (gender !== "female") return true;
  if (showWomenPhotos) return true;

  const age = getAge(birthDateGregorian);
  if (age === null) return false;
  return age <= FEMALE_PHOTO_AGE_THRESHOLD;
}

export function visiblePhotoUrl(
  photoUrl: string | null | undefined,
  gender: Gender | null | undefined,
  birthDateGregorian: string | null | undefined,
  showWomenPhotos: boolean
): string | null {
  if (!photoUrl) return null;
  if (!shouldShowPersonPhoto(gender, birthDateGregorian, showWomenPhotos)) return null;
  return photoUrl;
}

export function visibleFamilyPhotoUrl(
  familyPhotoUrl: string | null | undefined,
  gender: Gender | null | undefined,
  birthDateGregorian: string | null | undefined,
  showWomenPhotos: boolean
): string | null {
  if (!familyPhotoUrl) return null;
  if (!shouldShowPersonPhoto(gender, birthDateGregorian, showWomenPhotos)) return null;
  return familyPhotoUrl;
}
