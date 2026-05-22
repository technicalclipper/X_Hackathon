import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import RetroGridBackground from "@/components/ui/RetroGridBackground";

const geistSans = Public_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "FANVAS - Democratizing Fan Art",
  description:
    "The Google Doodle for sports clubs. Create, share, and celebrate fan art on the Chiliz network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <RetroGridBackground />
        {children}
      </body>
    </html>
  );
}
