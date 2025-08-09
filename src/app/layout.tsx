import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClassroomShare",
  description: "Partage d’écran simple (WebRTC, sans Firebase)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
