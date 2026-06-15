"use client";

import { useEffect, useId, useState } from "react";
import { sendMessageToAdmin } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactAdminFormProps {
  defaultSenderName?: string;
  onSent?: () => void;
}

export function ContactAdminForm({
  defaultSenderName = "",
  onSent,
}: ContactAdminFormProps) {
  const formId = useId();
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSenderName(defaultSenderName);
  }, [defaultSenderName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendMessageToAdmin(senderName, message);
      setMessage("");
      setSuccess(true);
      onSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשליחה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <Label htmlFor={`${formId}-senderName`}>שמך (אופציונלי)</Label>
        <Input
          id={`${formId}-senderName`}
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="שם מלא"
        />
      </div>
      <div>
        <Label htmlFor={`${formId}-adminMessage`}>הודעה *</Label>
        <Textarea
          id={`${formId}-adminMessage`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="כתוב כאן את ההודעה למנהל..."
          required
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-[#8b6914]">ההודעה נשלחה בהצלחה. תודה!</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "שולח..." : "שלח למנהל"}
        </Button>
      </div>
    </form>
  );
}
