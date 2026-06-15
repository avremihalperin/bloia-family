import { Heebo } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "מאגר משפחתי",
  description: "עץ משפחה מורחב — מאגר נתונים פרטי למשפחה",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className="min-h-full bg-amber-50/30 font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
