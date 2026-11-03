import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV Builder | Buat CV ATS-friendly gratis",
  description: "Buat CV ATS-friendly gratis dalam Bahasa Indonesia atau Inggris, dengan live preview dan unduh PDF. Tanpa daftar akun.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${instrument.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
