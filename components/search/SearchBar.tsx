"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Branch } from "@/lib/types";
import { generationFilterOptions } from "@/lib/generation-labels";

interface SearchBarProps {
  branches: Branch[];
}

function buildUrl(pathname: string, params: URLSearchParams) {
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function SearchBar({ branches }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const next = buildUrl(pathname, params);
      const current = buildUrl(pathname, searchParams);
      if (next !== current) {
        router.push(next);
      }
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (query === currentQ) return;

    const timer = setTimeout(() => {
      pushParams((params) => {
        if (query) params.set("q", query);
        else params.delete("q");
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchParams, pushParams]);

  return (
    <div className="glass-card grid gap-4 rounded-2xl p-5 md:grid-cols-4">
      <div className="md:col-span-2">
        <Label htmlFor="search">חיפוש לפי שם</Label>
        <Input
          id="search"
          placeholder="שם מלא, כינוי, טלפון או דוא&quot;ל..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="branch">משפחה</Label>
        <Select
          id="branch"
          value={searchParams.get("branch") || ""}
          onChange={(e) =>
            pushParams((params) => {
              if (e.target.value) params.set("branch", e.target.value);
              else params.delete("branch");
            })
          }
        >
          <option value="">כל המשפחות</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="generation">דור</Label>
        <Select
          id="generation"
          value={searchParams.get("gen") || ""}
          onChange={(e) =>
            pushParams((params) => {
              if (e.target.value) params.set("gen", e.target.value);
              else params.delete("gen");
            })
          }
        >
          <option value="">כל הדורות</option>
          {generationFilterOptions()
            .filter((o) => o.value !== "")
            .map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
        </Select>
      </div>
    </div>
  );
}
