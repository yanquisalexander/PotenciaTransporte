import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: "La Potencia Transporte",
  description: "Sistema de gestión de transporte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
