"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Branch, Person } from "@/lib/types";
import { downloadBranchTemplate } from "@/lib/branch-excel";
import { importBranchDescendants } from "@/app/actions/branch-import";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface BranchExcelPanelProps {
  branches: Branch[];
  people: Person[];
  initialBranchId?: string | null;
}

export function BranchExcelPanel({
  branches,
  people,
  initialBranchId,
}: BranchExcelPanelProps) {
  const router = useRouter();
  const [branchId, setBranchId] = useState(initialBranchId || branches[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const branch = branches.find((b) => b.id === branchId);
  const rootPerson = useMemo(
    () => (branch?.root_person_id ? people.find((p) => p.id === branch.root_person_id) : null),
    [branch, people]
  );

  const branchDescendants = useMemo(
    () => people.filter((p) => p.branch_id === branchId || p.id === branch?.root_person_id),
    [people, branchId, branch]
  );

  const handleDownload = () => {
    if (!branch || !rootPerson) {
      setError("בחר ענף תקין");
      return;
    }
    setError(null);
    downloadBranchTemplate(branch.label, rootPerson, branchDescendants);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !branchId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await importBranchDescendants(branchId, formData);
      setResult(res);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בייבוא");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  if (branches.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#c4a055]/20 bg-white/70 p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-[#1a1714]">
          ייבוא צאצאים לענף
        </h3>
        <p className="mt-1 text-sm text-stone-600">
          כל ענף (דור 2) יכול להוריד תבנית אקסל, למלא את צאצאיו (חוטר, נצר ומטה) ולהעלות.
          מיון: ענף = דור 2 · חוטר = דור 3 · נצר = דור 4
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="branch-import-select">בחר ענף (משפחה)</Label>
          <Select
            id="branch-import-select"
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setResult(null);
              setError(null);
            }}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={handleDownload} disabled={!rootPerson}>
            הורד תבנית אקסל
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="branch-import-file">העלה קובץ מלא</Label>
          <input
            id="branch-import-file"
            type="file"
            accept=".xlsx,.xls"
            disabled={loading || !branchId}
            onChange={handleUpload}
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#c4a055]/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#8b6914] hover:file:bg-[#c4a055]/25"
          />
        </div>
      </div>

      {rootPerson && (
        <p className="text-xs text-stone-500">
          ענף: {rootPerson.full_name} · {branchDescendants.length} אנשים רשומים במשפחה זו
        </p>
      )}

      {loading && <p className="text-sm text-stone-600">מייבא...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="rounded-xl border border-[#c4a055]/15 bg-[#faf7f2] px-4 py-3 text-sm">
          <p className="font-medium text-[#1a1714]">
            נוספו {result.created} · דולגו {result.skipped} (כבר קיימים)
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-red-700">
              {result.errors.slice(0, 8).map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
              {result.errors.length > 8 && (
                <li>ועוד {result.errors.length - 8} שגיאות...</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
