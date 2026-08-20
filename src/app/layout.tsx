import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { company } from "@/lib/brand";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${company.name} — Instant Quotes, Book & Track Your Move`,
    template: `%s · ${company.name}`,
  },
  description: company.description,
  keywords: [
    "movers",
    "moving company",
    "instant moving quote",
    "local movers",
    "long distance movers",
    company.address.city,
    "packing services",
    "book movers online",
  ],
  openGraph: {
    title: `${company.name} — ${company.tagline}`,
    description: company.description,
    type: "website",
  },
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
