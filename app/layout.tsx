import type { Metadata } from "next";
import "./globals.css";
import { labels } from "@/lib/labels";

export const metadata: Metadata = {
  title: labels.app.name,
  description: "Ndjekja e kostove të ndërtimit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
