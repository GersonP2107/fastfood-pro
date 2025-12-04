import type { Metadata } from "next";
import '@fontsource-variable/inter';
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodFast Pro - Menú Digital",
  description: "Sistema de menú digital y pedidos en línea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
