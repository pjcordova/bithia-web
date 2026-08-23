import { prisma } from "@/lib/prisma";
import { leerSeguro } from "@/lib/productos";
import { TIENDA_POR_DEFECTO } from "@/lib/contenido";

export type Tienda = {
  id: string | null;
  nombre: string;
  ciudad: string;
  foto_url: string | null;
  mapa_url: string;
};

/**
 * Datos del local, editables desde el panel.
 *
 * Si la fila todavía no existe —o si Neon no responde— se devuelven los
 * valores por defecto: el pie de página y el banner del local salen en todas
 * las páginas del sitio, y no vale la pena tumbarlas por esto. El id nulo es
 * la señal de que aún no hay fila que editar.
 */
export async function obtenerTienda(): Promise<Tienda> {
  return leerSeguro(
    "obtenerTienda",
    async () => {
      const fila = await prisma.tienda.findFirst();
      if (!fila) return { id: null, ...TIENDA_POR_DEFECTO };
      return {
        id: fila.id,
        nombre: fila.nombre,
        ciudad: fila.ciudad,
        foto_url: fila.foto_url,
        mapa_url: fila.mapa_url,
      };
    },
    { id: null, ...TIENDA_POR_DEFECTO }
  );
}
