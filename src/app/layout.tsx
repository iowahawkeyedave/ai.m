import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI.M",
  description: "AIM-inspired chat app for AI models and agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
