import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { Electrolize } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// const electrolize = Electrolize({
//   weight: '400',
//   subsets: ['latin'],
//   variable: '--font-electrolize',
// });

export const metadata: Metadata = {
  title: "MicroGrid Energy Monitor",
  description: "Renewable Microgrid Energy Monitoring Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}