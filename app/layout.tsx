import { Heebo, Rubik } from "next/font/google";
import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: APP_NAME,
  description: `${APP_NAME} — ${APP_TAGLINE}`,
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: APP_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable} h-full`}>
      <body className="app-bg min-h-full font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
