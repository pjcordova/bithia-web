import Image from "next/image";
import Link from "next/link";
import type { ProductoPublico } from "@/lib/productos";
import { esNueva, formatSoles } from "@/lib/format";
import { esColorClaro, resolverColor } from "@/lib/colores";

export function ProductCard({ producto }: { producto: ProductoPublico }) {
  const agotado = !producto.disponible;
  const nueva = !agotado && esNueva(producto.created_at);

  return (
    <Link
      href={`/producto/${producto.id}`}
      className="group block overflow-hidden rounded-tarjeta bg-white sombra-tarjeta transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] bg-rosa-suave/30">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition duration-300 group-hover:scale-[1.03] ${
              agotado ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-carbon-suave">
            Sin foto
          </div>
        )}

        {/* Se apilan arriba a la izquierda, como en las tiendas de referencia.
            "Agotado" manda: si no hay stock, lo demás sobra. */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {agotado ? (
            <Etiqueta className="bg-carbon/80">Agotado</Etiqueta>
          ) : (
            <>
              {producto.destacado && (
                <Etiqueta className="bg-white text-carbon">
                  Más pedido
                </Etiqueta>
              )}
              {nueva && <Etiqueta className="bg-terracota">Nuevo</Etiqueta>}
            </>
          )}
        </div>
      </div>

      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium text-carbon">
          {producto.nombre}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-terracota-oscuro">
            {formatSoles(producto.precio_venta)}
          </p>
          {producto.tallas.length > 0 && (
            <p className="text-[11px] uppercase tracking-wide text-carbon-suave">
              {producto.tallas.join(" · ")}
            </p>
          )}
        </div>
        <div className="mt-2">
          <PuntoColor
            nombre={producto.color_principal}
            hex={producto.color_hex}
          />
        </div>
      </div>
    </Link>
  );
}

/**
 * Punto de color de la prenda. Si no se puede resolver un color confiable se
 * muestra el nombre escrito: mejor la palabra que un círculo inventado.
 *
 * El nombre viaja siempre en title y en texto para lector de pantalla — un
 * punto a secas no comunica nada a quien no ve o no distingue colores.
 */
function PuntoColor({ nombre, hex }: { nombre: string; hex: string | null }) {
  const color = resolverColor(nombre, hex);

  if (!color) {
    return <p className="text-[11px] text-carbon-suave">{nombre}</p>;
  }

  return (
    <span className="flex items-center gap-1.5" title={nombre}>
      <span
        aria-hidden
        className={`inline-block h-3.5 w-3.5 rounded-full ${
          esColorClaro(color) ? "ring-1 ring-linea" : ""
        }`}
        style={{ backgroundColor: color }}
      />
      <span className="sr-only">Color: {nombre}</span>
    </span>
  );
}

function Etiqueta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white ${className}`}
    >
      {children}
    </span>
  );
}
