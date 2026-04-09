import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VAT Price Calculator — THB",
  description: "VAT breakdown tool — price range ฿15,000–฿18,000 ÷ 1.2084",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
