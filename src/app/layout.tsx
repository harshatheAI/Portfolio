import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Drape — Indian Ethnic Fashion for the Global Diaspora",
  description: "Your personal AI stylist for Indian ethnic wear. Shop sarees, lehengas, kurtas, and more from the top 10 Indian D2C brands — curated for NRIs worldwide.",
  keywords: ["Indian ethnic wear", "saree", "lehenga", "kurta", "NRI fashion", "Indian fashion abroad", "AI stylist"],
  openGraph: {
    title: "Drape — Your AI Indian Ethnic Stylist",
    description: "Shop Indian ethnic wear from top brands with a personal AI stylist in your pocket.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white text-[#2C2C2C] antialiased">
        {children}
      </body>
    </html>
  );
}
