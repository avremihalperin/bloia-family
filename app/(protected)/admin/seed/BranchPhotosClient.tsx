"use client";

import { BranchPhotoUpload } from "@/components/person/BranchPhotoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Branch, Person } from "@/lib/types";

interface BranchPhotosClientProps {
  branches: Branch[];
  gen2People: Person[];
}

export function BranchPhotosClient({ branches, gen2People }: BranchPhotosClientProps) {
  const personMap = new Map(gen2People.map((p) => [p.id, p]));

  if (branches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>תמונות משפחתיות</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">
            הוסף קודם אנשים בדור 2 — לכל אחד נוצרת משפחה גרעינית עם אפשרות לתמונה משפחתית.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>תמונות משפחתיות (משפחות גרעיניות)</CardTitle>
        <p className="text-sm text-stone-500">
          העלה תמונה משפחתית לכל ענף — דור 2 ומטה
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => {
            const root = branch.root_person_id
              ? personMap.get(branch.root_person_id)
              : null;
            const label = root?.full_name || branch.label;

            return (
              <BranchPhotoUpload
                key={branch.id}
                branchId={branch.id}
                label={label}
                currentPhoto={branch.photo_url}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
