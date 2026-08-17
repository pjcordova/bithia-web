import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Mi Catálogo",
  robots: { index: false, follow: false },
};

// El panel siempre muestra el estado real de la base, nunca una versión cacheada.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const filas = await prisma.productos.findMany({
    orderBy: { created_at: "desc" },
    include: { tallas: { select: { talla: true } } },
  });

  const productos = filas.map((p) => ({
    id: p.id,
    codigo_lote: p.codigo_lote,
    nombre: p.nombre,
    categoria: p.categoria,
    color_principal: p.color_principal,
    descripcion: p.descripcion,
    precio_venta: p.precio_venta.toNumber(),
    imagen_url: p.imagen_url,
    visible_en_tienda: p.visible_en_tienda,
    disponible: p.disponible,
    tallas: p.tallas.map((t) => t.talla),
  }));

  return <AdminDashboard productos={productos} />;
}
