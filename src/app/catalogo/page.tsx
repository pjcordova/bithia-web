import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CatalogoFiltrable } from "@/components/CatalogoFiltrable";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { listarProductosVisibles } from "@/lib/productos";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Vestidos, blusas, faldas, pantalones, blazers y tops. Tallas S, M y L. Bithia Brand, Galería Polvos Rosados, Ica.",
};

export default async function CatalogoPage() {
  const productos = await listarProductosVisibles();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-4">
        <h1 className="sr-only">Catálogo de Bithia Brand</h1>
        <CatalogoFiltrable productos={productos} />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
