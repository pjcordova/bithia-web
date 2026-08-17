import Image from "next/image";
import Link from "next/link";
import type { CategoriaDestacada } from "@/lib/productos";

/**
 * Fila de mosaicos altos con el nombre de la categoría sobre la foto.
 * A sangre completa y sin separación entre mosaicos, como la referencia:
 * la fila se lee como una sola pieza.
 */
export function SeccionCategorias({
  categorias,
}: {
  categorias: CategoriaDestacada[];
}) {
  if (categorias.length === 0) return null;

  return (
    <section className="mt-16" aria-label="Comprar por categoría">
      <h2 className="sr-only">Comprar por categoría</h2>
      {/* Ancho completo pero con aire a los costados: el mismo px del contenedor
          se aplica a izquierda y derecha, así el primer y el último mosaico
          quedan a igual distancia del borde. El gap separa las tarjetas. */}
      <div className="grid grid-cols-2 gap-3 px-3 md:grid-cols-4 md:gap-5 md:px-5">
        {categorias.slice(0, 4).map((c) => (
          <Link
            key={c.nombre}
            href={`/catalogo?categoria=${encodeURIComponent(c.nombre)}`}
            className="group relative block aspect-[3/4] overflow-hidden bg-rosa-suave/30"
          >
            {c.imagen ? (
              <Image
                src={c.imagen}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-rosa-suave to-terracota/25" />
            )}

            {/* Velo suave: el nombre tiene que leerse sobre cualquier foto. */}
            <div className="absolute inset-0 bg-carbon/10 transition group-hover:bg-carbon/20" />

            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-carbon px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white md:text-sm">
              {c.nombre}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
