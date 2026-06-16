"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { AdminMessage } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminMessagesClient({ messages }: { messages: AdminMessage[] }) {
  return (
    <CollapsibleSection
      title="הודעות מהמשפחה"
      subtitle="הודעות שנשלחו מדשבורד המשפחה"
      badge={messages.length}
      defaultOpen={messages.length > 0}
    >
      {messages.length === 0 ? (
        <p className="text-sm text-stone-500">אין הודעות עדיין</p>
      ) : (
        <div className="space-y-3">
          {messages.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#c4a055]/15 bg-white px-4 py-3"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-stone-500">
                <span className="font-medium text-[#1a1714]">
                  {item.sender_name || "אנונימי"}
                </span>
                <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
              </div>
              <p className="whitespace-pre-wrap text-sm text-stone-700">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
