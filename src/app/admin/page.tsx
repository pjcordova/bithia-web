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
    include: {
      tallas: {
        select: {
          talla: true,
          busto_cm: true,
          cintura_cm: true,
          cadera_cm: true,
          largo_cm: true,
        },
      },
    },
  });

  const productos = filas.map((p) => ({
    id: p.id,
    codigo_lote: p.codigo_lote,
    nombre: p.nombre,
    categoria: p.categoria,
    color_principal: p.color_principal,
    color_hex: p.color_hex,
    descripcion: p.descripcion,
    precio_venta: p.precio_venta.toNumber(),
    imagen_url: p.imagen_url,
    visible_en_tienda: p.visible_en_tienda,
    disponible: p.disponible,
    destacado: p.destacado,
    edicion_limitada: p.edicion_limitada,
    top_semana: p.top_semana,
    imagenes: p.imagenes,
    material: p.material,
    referencia_modelo: p.referencia_modelo,
    tallas: p.tallas.map((t) => t.talla),
    medidas: p.tallas.map((t) => ({
      talla: t.talla,
      busto_cm: t.busto_cm,
      cintura_cm: t.cintura_cm,
      cadera_cm: t.cadera_cm,
      largo_cm: t.largo_cm,
    })),
  }));

  return <AdminDashboard productos={productos} />;
}
