"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateBranchLabel } from "@/app/actions/family";
import { Input } from "@/components/ui/input";

interface BranchLabelCellProps {
  branchId: string | null;
  label: string;
}

export function BranchLabelCell({ branchId, label }: BranchLabelCellProps) {
  const router = useRouter();
  const [value, setValue] = useState(label);
  const [saving, setSaving] = useState(false);

  if (!branchId) {
    return <span className="text-stone-400">—</span>;
  }

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === label) return;

    setSaving(true);
    try {
      await updateBranchLabel(branchId, trimmed);
      router.refresh();
    } catch {
      setValue(label);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      disabled={saving}
      className="min-w-[8rem] border-[#c4a055]/25 bg-white/80 text-sm"
      placeholder="שם ענף"
    />
  );
}
