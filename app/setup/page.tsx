import { redirect } from "next/navigation";
import { isPasswordConfigured } from "@/lib/data";
import { SetupForm } from "./SetupForm";

export default async function SetupPage() {
  const configured = await isPasswordConfigured();
  if (configured) {
    redirect("/login");
  }

  return <SetupForm />;
}
