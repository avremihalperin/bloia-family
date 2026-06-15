"use client";

import { useEffect, useState } from "react";
import { ContactAdminForm } from "@/components/dashboard/ContactAdminForm";
import { Button } from "@/components/ui/button";

interface ContactAdminDialogProps {
  defaultSenderName?: string;
}

export function ContactAdminDialog({ defaultSenderName = "" }: ContactAdminDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[#c4a055]/40 px-3.5 py-2 text-sm font-medium text-[#e8d5a3] transition-all duration-200 hover:border-[#c4a055] hover:bg-[#c4a055]/10"
      >
        הודעה למנהל
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="סגור"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-admin-title"
            className="relative z-10 w-full max-w-lg rounded-2xl border border-[#c4a055]/20 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5">
              <h2 id="contact-admin-title" className="font-display text-xl font-semibold text-[#1a1714]">
                שליחת הודעה למנהל
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                בקשה לעדכון, תיקון או שאלה — המנהל יראה את ההודעה בדף הניהול
              </p>
            </div>

            <ContactAdminForm
              defaultSenderName={defaultSenderName}
              onSent={() => {
                window.setTimeout(() => setOpen(false), 1200);
              }}
            />

            <div className="mt-4 flex justify-start">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                סגור
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
