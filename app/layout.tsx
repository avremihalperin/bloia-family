import { Heebo, Rubik } from "next/font/google";
import type { Metadata } from "next";
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
  title: "משפחת בלויא",
  description: "עץ משפחה מורחב — מאגר נתונים פרטי למשפחה",
  robots: { index: false, follow: false },
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
