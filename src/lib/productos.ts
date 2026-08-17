import { prisma } from "@/lib/prisma";
import { NOMBRES_CATEGORIA } from "@/lib/categorias";

// Prisma devuelve `precio_venta` como Decimal, que no es serializable hacia un
// Client Component. Toda lectura pasa por aquí y sale como number.
export type ProductoPublico = {
  id: string;
  codigo_lote: string;
  nombre: string;
  categoria: string;
  color_principal: string;
  color_hex: string | null;
  descripcion: string | null;
  precio_venta: number;
  imagen_url: string | null;
  imagenes: string[];
  material: string | null;
  referencia_modelo: string | null;
  disponible: boolean;
  destacado: boolean;
  edicion_limitada: boolean;
  top_semana: boolean;
  banner_inferior: boolean;
  created_at: Date;
  tallas: string[];
  /** Medidas de la prenda por talla. Vacío si no se cargaron. */
  medidas: MedidaTalla[];
  /** Portada + adicionales, sin huecos. */
  galeria: string[];
};

export type MedidaTalla = {
  talla: string;
  busto_cm: number | null;
  cintura_cm: number | null;
  cadera_cm: number | null;
  largo_cm: number | null;
};

type ProductoConTallas = {
  id: string;
  codigo_lote: string;
  nombre: string;
  categoria: string;
  color_principal: string;
  color_hex: string | null;
  descripcion: string | null;
  precio_venta: { toNumber(): number };
  imagen_url: string | null;
  imagenes: string[];
  material: string | null;
  referencia_modelo: string | null;
  disponible: boolean;
  destacado: boolean;
  edicion_limitada: boolean;
  top_semana: boolean;
  banner_inferior: boolean;
  created_at: Date;
  tallas: MedidaTalla[];
};

const ORDEN_TALLA = ["S", "M", "L"];

function serializar(p: ProductoConTallas): ProductoPublico {
  const porOrden = (a: { talla: string }, b: { talla: string }) =>
    ORDEN_TALLA.indexOf(a.talla) - ORDEN_TALLA.indexOf(b.talla);

  const medidas = [...p.tallas].sort(porOrden);

  return {
    ...p,
    precio_venta: p.precio_venta.toNumber(),
    tallas: medidas.map((t) => t.talla),
    medidas,
    // La portada va primero y se descartan huecos: una galería con un null en
    // el medio rompería la navegación del deslizable.
    galeria: [p.imagen_url, ...p.imagenes].filter(
      (u): u is string => typeof u === "string" && u.length > 0
    ),
  };
}

const seleccion = {
  id: true,
  codigo_lote: true,
  nombre: true,
  categoria: true,
  color_principal: true,
  color_hex: true,
  descripcion: true,
  precio_venta: true,
  imagen_url: true,
  imagenes: true,
  material: true,
  referencia_modelo: true,
  disponible: true,
  destacado: true,
  edicion_limitada: true,
  top_semana: true,
  banner_inferior: true,
  created_at: true,
  tallas: {
    select: {
      talla: true,
      busto_cm: true,
      cintura_cm: true,
      cadera_cm: true,
      largo_cm: true,
    },
  },
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

/**
 * Prenda que protagoniza la banda de "Edición limitada".
 * Si hay varias marcadas gana la más reciente, para que marcar una nueva
 * reemplace a la anterior sin tener que acordarse de apagarla.
 */
export async function obtenerEdicionLimitada(): Promise<ProductoPublico | null> {
  return leerSeguro(
    "obtenerEdicionLimitada",
    async () => {
      const fila = await prisma.productos.findFirst({
        where: {
          visible_en_tienda: true,
          edicion_limitada: true,
          // Sin foto la banda no tiene sentido: es una pieza puramente visual.
          imagen_url: { not: null },
        },
        select: seleccion,
        orderBy: { created_at: "desc" },
      });
      return fila ? serializar(fila) : null;
    },
    null
  );
}

/** Prenda protagonista de la segunda banda ancha. */
export async function obtenerBannerInferior(): Promise<ProductoPublico | null> {
  return leerSeguro(
    "obtenerBannerInferior",
    async () => {
      const fila = await prisma.productos.findFirst({
        where: {
          visible_en_tienda: true,
          banner_inferior: true,
          imagen_url: { not: null },
        },
        select: seleccion,
        orderBy: { created_at: "desc" },
      });
      return fila ? serializar(fila) : null;
    },
    null
  );
}

/** Prenda protagonista de "Top de la semana". Gana la más reciente marcada. */
export async function obtenerTopSemana(): Promise<ProductoPublico | null> {
  return leerSeguro(
    "obtenerTopSemana",
    async () => {
      const fila = await prisma.productos.findFirst({
        where: {
          visible_en_tienda: true,
          top_semana: true,
          imagen_url: { not: null },
        },
        select: seleccion,
        orderBy: { created_at: "desc" },
      });
      return fila ? serializar(fila) : null;
    },
    null
  );
}

export type CategoriaDestacada = {
  nombre: string;
  imagen: string | null;
  cantidad: number;
};

/**
 * Categorías para la fila de mosaicos de la portada, con una foto de muestra.
 *
 * La foto no se administra aparte: se toma de la prenda más reciente de esa
 * categoría. Así el mosaico se renueva solo con cada carga de mercadería, sin
 * que la dueña tenga que mantener imágenes de portada además del catálogo.
 */
export async function listarCategoriasDestacadas(): Promise<
  CategoriaDestacada[]
> {
  return leerSeguro(
    "listarCategoriasDestacadas",
    async () => {
      const filas = await prisma.productos.findMany({
        where: { visible_en_tienda: true },
        select: { categoria: true, imagen_url: true },
        orderBy: { created_at: "desc" },
      });

      const porCategoria = new Map<string, CategoriaDestacada>();
      for (const { categoria, imagen_url } of filas) {
        const actual = porCategoria.get(categoria);
        if (!actual) {
          porCategoria.set(categoria, {
            nombre: categoria,
            imagen: imagen_url,
            cantidad: 1,
          });
        } else {
          actual.cantidad += 1;
          // Las filas vienen de la más nueva a la más vieja, así que la
          // primera con foto es la más reciente que tiene una.
          if (!actual.imagen) actual.imagen = imagen_url;
        }
      }

      // Se respeta el orden fijo del catálogo, no el de la base.
      return NOMBRES_CATEGORIA.map((n) => porCategoria.get(n)).filter(
        (c): c is CategoriaDestacada => Boolean(c)
      );
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
