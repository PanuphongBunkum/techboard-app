import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers"; // นำเข้า Providers

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechBoard - เว็บบอร์ดสำหรับนักพัฒนา",
  description: "ระบบเว็บบอร์ดที่ผสานพลัง AI โดย พานุพงษ์",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers> 
      </body>
    </html>
  );
}