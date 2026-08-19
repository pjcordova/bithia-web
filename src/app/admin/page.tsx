import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import type { AdminLook } from "@/components/admin/AdminSeccionShopTheLook";
import type { CategoriaDestacada } from "@/lib/productos";
import { NOMBRES_CATEGORIA } from "@/lib/categorias";
import { listarSlidesAdmin } from "@/lib/hero";

export const metadata: Metadata = {
  title: "Mi Catálogo",
  robots: { index: false, follow: false },
};

// El panel siempre muestra el estado real de la base, nunca una versión cacheada.
export const dynamic = "force-dynamic";

const tallasSelect = {
  select: {
    talla: true,
    busto_cm: true,
    cintura_cm: true,
    cadera_cm: true,
    largo_cm: true,
  },
} as const;

type FilaConTallas = {
  id: string;
  codigo_lote: string;
  nombre: string;
  categoria: string;
  color_principal: string;
  color_hex: string | null;
  descripcion: string | null;
  precio_venta: { toNumber(): number };
  imagen_url: string | null;
  visible_en_tienda: boolean;
  disponible: boolean;
  destacado: boolean;
  edicion_limitada: boolean;
  top_semana: boolean;
  banner_inferior: boolean;
  imagenes: string[];
  material: string | null;
  referencia_modelo: string | null;
  created_at: Date;
  tallas: {
    talla: string;
    busto_cm: number | null;
    cintura_cm: number | null;
    cadera_cm: number | null;
    largo_cm: number | null;
  }[];
};

/**
 * A diferencia de lib/productos.ts (que sirve la web pública), acá no se
 * filtra por visible_en_tienda ni se recorta ningún campo: el panel necesita
 * ver y poder reactivar también lo que está oculto o agotado.
 */
function mapearProducto(p: FilaConTallas): ProductoAdmin {
  return {
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
    banner_inferior: p.banner_inferior,
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
  };
}

/** Misma lógica que listarCategoriasDestacadas, sin el filtro de visibilidad. */
function derivarCategorias(productos: ProductoAdmin[]): CategoriaDestacada[] {
  const porCategoria = new Map<string, CategoriaDestacada>();
  // Los productos ya vienen del más nuevo al más viejo (orderBy created_at desc).
  for (const { categoria, imagen_url } of productos) {
    const actual = porCategoria.get(categoria);
    if (!actual) {
      porCategoria.set(categoria, { nombre: categoria, imagen: imagen_url, cantidad: 1 });
    } else {
      actual.cantidad += 1;
      if (!actual.imagen) actual.imagen = imagen_url;
    }
  }
  return NOMBRES_CATEGORIA.map((n) => porCategoria.get(n)).filter(
    (c): c is CategoriaDestacada => Boolean(c)
  );
}

async function obtenerLookAdmin(): Promise<AdminLook | null> {
  const look = await prisma.looks.findFirst({
    where: { activo: true },
    orderBy: { created_at: "desc" },
    include: {
      items: {
        orderBy: { orden: "asc" },
        include: { productos: { include: { tallas: tallasSelect } } },
      },
    },
  });
  if (!look || look.items.length === 0) return null;

  return {
    titulo: look.titulo,
    etiqueta: look.etiqueta,
    imagen_url: look.imagen_url,
    items: look.items.map((i) => ({
      producto: mapearProducto(i.productos),
      posX: i.pos_x,
      posY: i.pos_y,
    })),
  };
}

export default async function AdminPage() {
  const [filas, look, slides] = await Promise.all([
    prisma.productos.findMany({
      orderBy: { created_at: "desc" },
      include: { tallas: tallasSelect },
    }),
    obtenerLookAdmin(),
    listarSlidesAdmin(),
  ]);

  const productos = filas.map(mapearProducto);
  const categorias = derivarCategorias(productos);

  return (
    <AdminDashboard
      productos={productos}
      categorias={categorias}
      look={look}
      slides={slides}
    />
  );
}
