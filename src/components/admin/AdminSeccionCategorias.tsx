import Image from "next/image";
import type { CategoriaDestacada } from "@/lib/productos";

/**
 * Calco de <SeccionCategorias>, pero sin el Link a /catalogo: en el admin
 * solo cumple función de referencia visual (para ubicarse en la página), no
 * de navegación — tocarlo no debe sacar a la dueña del panel.
 */
export function AdminSeccionCategorias({
  categorias,
}: {
  categorias: CategoriaDestacada[];
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
          </div>
        ))}
      </div>
    </section>
  );
}
