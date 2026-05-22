import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anibook — book recommendations from anime",
  description: "Find books that match the anime you love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-3">
            <Link href="/" className="shrink-0 text-lg font-bold">
              Anibook
            </Link>
            <SearchBar />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
