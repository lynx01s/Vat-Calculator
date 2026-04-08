import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VAT Price Calculator — THB",
  description: "Price breakdown with VAT calculation (÷ 1.2084)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
