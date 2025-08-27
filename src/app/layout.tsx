import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyBaby",
  description: "Location d'équipements pour bébé dans votre hôtel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}