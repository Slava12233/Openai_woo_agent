import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "מערכת ניהול WooCommerce",
  description: "מערכת חכמה לניהול חנות WooCommerce באמצעות AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
