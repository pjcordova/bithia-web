import { prisma } from "@/lib/prisma";

export type Coleccion = {
  id: string;
  nombre: string;
  publicada_at: Date | null;
  /** Cuántas prendas tiene asignadas, publicadas o no. */
  prendas: number;
  /** Cuántas de esas están publicadas en la tienda. */
  publicadas: number;
};

/**
 * La colección vigente: la publicada más reciente.
 *
 * Decide qué sale en "Nuevos ingresos". Si no hay ninguna publicada devuelve
 * null y esa sección vuelve a su comportamiento de siempre —las 4 prendas más
 * recientes— así que el sitio funciona igual mientras nadie use colecciones.
 */
export async function obtenerColeccionVigente(): Promise<{
  id: string;
  nombre: string;
} | null> {
  const fila = await prisma.colecciones.findFirst({
    where: { publicada_at: { not: null } },
    orderBy: { publicada_at: "desc" },
    select: { id: true, nombre: true },
  });
  return fila;
}

/** Todas las colecciones para el panel, de la más nueva a la más vieja. */
export async function listarColecciones(): Promise<Coleccion[]> {
  const filas = await prisma.colecciones.findMany({
    orderBy: [{ publicada_at: "desc" }, { created_at: "desc" }],
    select: {
      id: true,
      nombre: true,
      publicada_at: true,
      productos: { select: { visible_en_tienda: true } },
    },
  });

  return filas.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    publicada_at: c.publicada_at,
    prendas: c.productos.length,
    publicadas: c.productos.filter((p) => p.visible_en_tienda).length,
  }));
}
