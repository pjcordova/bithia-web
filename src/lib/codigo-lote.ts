import { prisma } from "@/lib/prisma";
import { prefijoDe } from "@/lib/categorias";

/**
 * Genera el siguiente código de lote para una categoría: VES-2508-03
 *   VES  prefijo de categoría
 *   2508 año (2 dígitos) + mes (2 dígitos) de alta
 *   03   correlativo dentro de ese prefijo y ese mes
 *
 * El correlativo se calcula sobre los códigos ya existentes, así que
 * eliminar una prenda no reutiliza su número mientras queden posteriores.
 */
export async function generarCodigoLote(categoria: string): Promise<string> {
  const prefijo = prefijoDe(categoria);
  const ahora = new Date();
  const periodo = `${String(ahora.getFullYear()).slice(-2)}${String(
    ahora.getMonth() + 1
  ).padStart(2, "0")}`;
  const raiz = `${prefijo}-${periodo}-`;

  const existentes = await prisma.productos.findMany({
    where: { codigo_lote: { startsWith: raiz } },
    select: { codigo_lote: true },
  });

  const mayor = existentes.reduce((max, { codigo_lote }) => {
    const n = Number.parseInt(codigo_lote.slice(raiz.length), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  return `${raiz}${String(mayor + 1).padStart(2, "0")}`;
}

/** Acepta el formato ABC-2508-03 (lo que la dueña puede escribir a mano). */
export function esCodigoLoteValido(codigo: string): boolean {
  return /^[A-Z]{2,4}-\d{4}-\d{2,3}$/.test(codigo);
}
