import Image from "next/image";
import { Pencil } from "lucide-react";
import type { CategoriaDestacada } from "@/lib/productos";

/**
 * Calco de <SeccionCategorias>, pero sin el Link a /catalogo: tocarlo no debe
 * sacar a la dueña del panel. Cada mosaico lleva encima el botón para fijarle
 * una foto, y un distintivo que dice si la actual se eligió a mano o se está
 * heredando de la prenda más reciente de esa categoría.
 */
export function AdminSeccionCategorias({
  categorias,
  fijadas,
  onEditarFoto,
}: {
  categorias: CategoriaDestacada[];
  /** Categorías con foto elegida a mano. */
  fijadas?: ReadonlySet<string>;
  onEditarFoto?: (nombre: string) => void;
}) {
  if (categorias.length === 0) return null;

  return (
    <section className="mt-16" aria-label="Categorías (referencia)">
      <div className="grid grid-cols-2 gap-3 px-3 md:grid-cols-4 md:gap-5 md:px-5">
        {categorias.slice(0, 4).map((c) => (
          <div
            key={c.nombre}
            className="relative block aspect-[3/4] overflow-hidden bg-rosa-suave/30"
          >
            {c.imagen ? (
              <Image
                src={c.imagen}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-rosa-suave to-terracota/25" />
            )}
            <div className="absolute inset-0 bg-carbon/10" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-carbon px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white md:text-sm">
              {c.nombre}
            </span>

            {onEditarFoto && (
              <>
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                    fijadas?.has(c.nombre)
                      ? "bg-terracota text-white"
                      : "bg-white/90 text-carbon"
                  }`}
                >
                  {fijadas?.has(c.nombre) ? "Foto fija" : "Automática"}
                </span>
                <button
                  type="button"
                  onClick={() => onEditarFoto(c.nombre)}
                  aria-label={`Cambiar la foto de ${c.nombre}`}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-carbon shadow-md transition hover:bg-white"
                >
                  <Pencil size={13} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
