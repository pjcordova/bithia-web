import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductoDetalle } from "@/components/ProductoDetalle";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { obtenerProducto } from "@/lib/productos";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const producto = await obtenerProducto(id);
  if (!producto) return { title: "Prenda no encontrada" };

  const descripcion =
    producto.descripcion ??
    `${producto.nombre} en ${producto.color_principal}. ${producto.categoria} de Bithia Brand, Ica.`;

  return {
    title: producto.nombre,
    description: descripcion,
    // Compartir la ficha por WhatsApp es la forma normal de consultar por una
    // prenda: la vista previa tiene que mostrar la foto y el precio, no un
    // enlace pelado.
    openGraph: {
      title: producto.nombre,
      description: descripcion,
      type: "website",
      images: producto.imagen_url
        ? [{ url: producto.imagen_url, width: 1200, height: 630, alt: producto.nombre }]
        : undefined,
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const producto = await obtenerProducto(id);
  if (!producto) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-4">
        <ProductoDetalle producto={producto} />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
