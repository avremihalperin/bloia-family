"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Branch, Person } from "@/lib/types";
import { displayBirthDates } from "@/lib/hebrew-date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PeopleTableProps {
  people: Person[];
  branches: Branch[];
}

export function PeopleTable({ people, branches }: PeopleTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const branchMap = useMemo(
    () => new Map(branches.map((b) => [b.id, b.label])),
    [branches]
  );

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "שם מלא",
        cell: ({ row }) => (
          <Link href={`/person/${row.original.id}`} className="font-medium text-[#8b6914] hover:underline">
            {row.original.full_name}
          </Link>
        ),
      },
      { accessorKey: "nickname", header: "כינוי" },
      {
        accessorKey: "generation",
        header: "דור",
        cell: ({ row }) => <Badge>דור {row.original.generation}</Badge>,
      },
      {
        id: "birth",
        header: "תאריך לידה",
        cell: ({ row }) => {
          const dates = displayBirthDates(
            row.original.birth_date_gregorian,
            row.original.birth_date_hebrew
          );
          return (
            <div className="text-sm">
              {dates.gregorian && <div>{dates.gregorian}</div>}
              {dates.hebrew && <div className="text-stone-500">{dates.hebrew}</div>}
            </div>
          );
        },
      },
      { accessorKey: "residence", header: "מגורים" },
      {
        accessorKey: "phone",
        header: "טלפון",
        cell: ({ row }) =>
          row.original.phone ? (
            <a href={`tel:${row.original.phone}`} className="text-[#8b6914] hover:underline" dir="ltr">
              {row.original.phone}
            </a>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "email",
        header: "דוא\"ל",
        cell: ({ row }) =>
          row.original.email ? (
            <a href={`mailto:${row.original.email}`} className="text-[#8b6914] hover:underline" dir="ltr">
              {row.original.email}
            </a>
          ) : (
            "—"
          ),
      },
      {
        id: "branch",
        header: "משפחה",
        cell: ({ row }) =>
          row.original.branch_id ? branchMap.get(row.original.branch_id) : "—",
      },
      { accessorKey: "family_position", header: "מיקום במשפחה" },
    ],
    [branchMap]
  );

  const table = useReactTable({
    data: people,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportCsv = () => {
    const headers = ["שם מלא", "כינוי", "דור", "תאריך לועזי", "תאריך עברי", "מגורים", "טלפון", "דוא\"ל", "משפחה", "מיקום"];
    const rows = people.map((p) => {
      const dates = displayBirthDates(p.birth_date_gregorian, p.birth_date_hebrew);
      return [
        p.full_name,
        p.nickname || "",
        String(p.generation || ""),
        dates.gregorian || "",
        dates.hebrew || "",
        p.residence || "",
        p.phone || "",
        p.email || "",
        p.branch_id ? branchMap.get(p.branch_id) || "" : "",
        p.family_position || "",
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-tree.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={exportCsv}>
          ייצוא CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#c4a055]/15 bg-white/60 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#c4a055]/10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="cursor-pointer px-4 py-3.5 text-right font-semibold text-[#1a1714]"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-[#c4a055]/10 transition-colors hover:bg-[#c4a055]/5">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
