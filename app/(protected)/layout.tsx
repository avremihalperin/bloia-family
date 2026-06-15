import { AppNav } from "@/components/layout/AppNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">{children}</main>
    </>
  );
}
