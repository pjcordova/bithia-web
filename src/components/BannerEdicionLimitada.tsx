import Image from "next/image";
import Link from "next/link";
import type { ProductoPublico } from "@/lib/productos";
import { formatSoles } from "@/lib/format";

/**
 * Banda a sangre completa con una prenda protagonista.
 *
 * La referencia usa dos fotos distintas a los lados, pero cada prenda de
 * Bithia tiene una sola. Se usa la misma imagen en ambos costados con encuadre
 * opuesto (izquierda y derecha), así se lee como dos tomas de la misma sesión
 * en vez de una foto repetida. En celular se muestra una sola.
 */
export function BannerEdicionLimitada({
  producto,
}: {
  producto: ProductoPublico | null;
}) {
  if (!producto?.imagen_url) return null;

  return (
    <section
      className="mt-16 bg-rosa-suave/40"
      aria-label={`Edición limitada: ${producto.nombre}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <Costado
          src={producto.imagen_url}
          alt={producto.nombre}
          posicion="left"
        />

        <div className="flex flex-col items-center justify-center px-6 py-14 text-center md:px-12 md:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-carbon-suave">
            Edición limitada
          </p>
          <h2 className="mt-4 max-w-md text-2xl font-bold uppercase leading-tight tracking-[0.04em] text-carbon md:text-4xl">
            {producto.nombre}
          </h2>
          {/* El precio se parte en dos tamaños solo por estética. Se oculta a
              lectores de pantalla y se expone una única vez bien formado, o se
              leería dos veces. */}
          <p className="mt-5 text-carbon">
            <span aria-hidden>
              <span className="align-top text-sm font-semibold">S/ </span>
              <span className="text-3xl font-bold md:text-4xl">
                {producto.precio_venta.toFixed(2)}
              </span>
            </span>
            <span className="sr-only">{formatSoles(producto.precio_venta)}</span>
          </p>
          <Link
            href={`/producto/${producto.id}`}
            className="mt-8 inline-block bg-carbon px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-carbon/85"
          >
            Ver prenda
          </Link>
          {!producto.disponible && (
            <p className="mt-4 text-xs uppercase tracking-[0.1em] text-rosa">
              Agotada por ahora
            </p>
          )}
        </div>

        {/* Segundo costado: decorativo y solo en desktop. */}
        <Costado
          src={producto.imagen_url}
          alt=""
          posicion="right"
          soloDesktop
        />
      </div>
    </section>
  );
}

function Costado({
  src,
  alt,
  posicion,
  soloDesktop = false,
}: {
  src: string;
  alt: string;
  posicion: "left" | "right";
  soloDesktop?: boolean;
}) {
  return (
    <div
      className={`relative h-72 md:h-[32rem] ${soloDesktop ? "hidden md:block" : ""}`}
      aria-hidden={alt === "" ? true : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 35vw"
        className="object-cover"
        style={{ objectPosition: posicion === "left" ? "25% center" : "75% center" }}
      />
    </div>
  );
}
