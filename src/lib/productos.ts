import { prisma } from "@/lib/prisma";

// Prisma devuelve `precio_venta` como Decimal, que no es serializable hacia un
// Client Component. Toda lectura pasa por aquí y sale como number.
export type ProductoPublico = {
  id: string;
  codigo_lote: string;
  nombre: string;
  categoria: string;
  color_principal: string;
  descripcion: string | null;
  precio_venta: number;
  imagen_url: string | null;
  disponible: boolean;
  destacado: boolean;
  created_at: Date;
  tallas: string[];
};

type ProductoConTallas = {
  id: string;
  codigo_lote: string;
  nombre: string;
  categoria: string;
  color_principal: string;
  descripcion: string | null;
  precio_venta: { toNumber(): number };
  imagen_url: string | null;
  disponible: boolean;
  destacado: boolean;
  created_at: Date;
  tallas: { talla: string }[];
};

const ORDEN_TALLA = ["S", "M", "L"];

function serializar(p: ProductoConTallas): ProductoPublico {
  return {
    ...p,
    precio_venta: p.precio_venta.toNumber(),
    tallas: p.tallas
      .map((t) => t.talla)
      .sort((a, b) => ORDEN_TALLA.indexOf(a) - ORDEN_TALLA.indexOf(b)),
  };
}

const seleccion = {
  id: true,
  codigo_lote: true,
  nombre: true,
  categoria: true,
  color_principal: true,
  descripcion: true,
  precio_venta: true,
  imagen_url: true,
  disponible: true,
  destacado: true,
  created_at: true,
  tallas: { select: { talla: true } },
} as const;

/**
 * Las páginas públicas se prerenderizan en el build. Si la base no responde en
 * ese momento, dejamos caer la página entera y el despliegue completo falla —
 * incluido el panel admin, que sí funcionaría. Preferimos registrar el error y
 * devolver vacío: la revalidación de la hora siguiente repuebla el catálogo.
 */
async function leerSeguro<T>(
  etiqueta: string,
  consulta: () => Promise<T>,
  respaldo: T
): Promise<T> {
  try {
    return await consulta();
  } catch (e) {
    console.error(`[productos] falló ${etiqueta}:`, e);
    return respaldo;
  }
}

/** Catálogo público: solo lo que la dueña marcó visible. */
export async function listarProductosVisibles(): Promise<ProductoPublico[]> {
  return leerSeguro(
    "listarProductosVisibles",
    async () => {
      const filas = await prisma.productos.findMany({
        where: { visible_en_tienda: true },
        select: seleccion,
        orderBy: { created_at: "desc" },
      });
      return filas.map(serializar);
    },
    []
  );
}

export async function listarNovedades(limite = 4): Promise<ProductoPublico[]> {
  return leerSeguro(
    "listarNovedades",
    async () => {
      const filas = await prisma.productos.findMany({
        where: { visible_en_tienda: true },
        select: seleccion,
        orderBy: { created_at: "desc" },
        take: limite,
      });
      return filas.map(serializar);
    },
    []
  );
}

/**
 * "Los más pedidos" de la portada. Se ordena por marcado manual, no por
 * ventas: sin tabla de pedidos no hay nada que contar.
 */
export async function listarDestacados(limite = 8): Promise<ProductoPublico[]> {
  return leerSeguro(
    "listarDestacados",
    async () => {
      const filas = await prisma.productos.findMany({
        where: { visible_en_tienda: true, destacado: true },
        select: seleccion,
        orderBy: { created_at: "desc" },
        take: limite,
      });
      return filas.map(serializar);
    },
    []
  );
}

export async function obtenerProducto(
  id: string
): Promise<ProductoPublico | null> {
  // Un id que no es UUID hace que Postgres lance en vez de devolver vacío.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }
  return leerSeguro(
    "obtenerProducto",
    async () => {
      const fila = await prisma.productos.findFirst({
        where: { id, visible_en_tienda: true },
        select: seleccion,
      });
      return fila ? serializar(fila) : null;
    },
    null
  );
}
