import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bithia Brand — Moda femenina en Ica",
    template: "%s · Bithia Brand",
  },
  description:
    "Prendas exclusivas de moda femenina con la calidez de Ica. Mercadería nueva cada 15 días. Polvos Azules, Stand 170, Ica.",
  openGraph: {
    title: "Bithia Brand — Moda femenina en Ica",
    description:
      "Prendas exclusivas de moda femenina con la calidez de Ica. Mercadería nueva cada 15 días.",
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" className={inter.variable}>
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
