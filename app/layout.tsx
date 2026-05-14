import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HIPAA Guard — Healthcare Compliance OS",
  description: "HIPAA compliance enforced everywhere inside your organisation. The immune system for your hospital's data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
