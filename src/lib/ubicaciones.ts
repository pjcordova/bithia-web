import type { ProductoAdmin } from "@/components/admin/ProductForm";

/**
 * En qué lugares de la portada aparece cada prenda.
 *
 * Existe porque una misma prenda puede ocupar varios espacios a la vez —hoy
 * el 41% lo hace— y el panel no lo decía en ninguna parte: se cambiaba una
 * foto esperando tocar un solo sitio y aparecía cambiada en tres más. Esto no
 * modifica ese comportamiento, solo lo vuelve visible.
 *
 * Replica la selección real de lib/productos.ts, filtro de visibilidad
 * incluido: una prenda oculta no sale en ningún lado, y decir lo contrario
 * sería peor que no decir nada. Si allá cambia un criterio, acá también.
 */

export const SECCIONES = {
  destacados: "Los más pedidos",
  novedades: "Nuevos ingresos",
  edicionLimitada: "Edición limitada",
  topSemana: "Top de la semana",
  bannerInferior: "Banner inferior",
  look: "Shop the look",
} as const;

/**
 * @param productos Todas las prendas, de la más nueva a la más vieja (así las
 *   entrega el panel). El orden importa: varias secciones toman "la primera".
 * @param idsEnLook Prendas asociadas al "look" activo.
 */
export function calcularUbicaciones(
  productos: ProductoAdmin[],
  idsEnLook: ReadonlySet<string>
): Map<string, string[]> {
  const visibles = productos.filter((p) => p.visible_en_tienda);
  const ubicaciones = new Map<string, string[]>();

  const anotar = (id: string, donde: string) => {
    const previas = ubicaciones.get(id);
    if (previas) previas.push(donde);
    else ubicaciones.set(id, [donde]);
  };

  // Mismos recortes que la portada: 8 destacados y 4 novedades.
  for (const p of visibles.filter((p) => p.destacado).slice(0, 8)) {
    anotar(p.id, SECCIONES.destacados);
  }
  for (const p of visibles.slice(0, 4)) {
    anotar(p.id, SECCIONES.novedades);
  }

  // Las bandas muestran una sola prenda: gana la más reciente con foto, así
  // que marcar una nueva reemplaza a la anterior sin apagarla.
  const primeraConFoto = (filtro: (p: ProductoAdmin) => boolean) =>
    visibles.find((p) => filtro(p) && p.imagen_url);

  const limitada = primeraConFoto((p) => p.edicion_limitada);
  if (limitada) anotar(limitada.id, SECCIONES.edicionLimitada);

  const top = primeraConFoto((p) => p.top_semana);
  if (top) anotar(top.id, SECCIONES.topSemana);

  const banner = primeraConFoto((p) => p.banner_inferior);
  if (banner) anotar(banner.id, SECCIONES.bannerInferior);

  for (const p of visibles) {
    if (idsEnLook.has(p.id)) anotar(p.id, SECCIONES.look);
  }

  // El mosaico de cada categoría no tiene foto propia: hereda la de la prenda
  // más reciente de esa categoría que tenga una. Es el caso que más sorprende,
  // porque la prenda nunca se marcó para eso.
  const mosaicoTomado = new Set<string>();
  for (const p of visibles) {
    if (!p.imagen_url || mosaicoTomado.has(p.categoria)) continue;
    mosaicoTomado.add(p.categoria);
    anotar(p.id, `Mosaico “${p.categoria}”`);
  }

  return ubicaciones;
}
