"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ItemLook, Look, ProductoPublico } from "@/lib/productos";
import { formatSoles, esNueva } from "@/lib/format";
import { esColorClaro, resolverColor } from "@/lib/colores";

/**
 * "Compra el conjunto": la foto del look completo a la izquierda y, a la
 * derecha, las prendas que lo componen una por una.
 */
export function SeccionShopTheLook({ look }: { look: Look | null }) {
  const [indice, setIndice] = useState(0);

  if (!look || look.items.length === 0) return null;

  const item = look.items[Math.min(indice, look.items.length - 1)];

  return (
    <section className="mt-20" aria-labelledby="shop-the-look">
      <h2
        id="shop-the-look"
        className="text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl"
      >
        {look.titulo}
      </h2>

      <div className="mx-auto mt-10 grid max-w-6xl items-start gap-8 px-4 md:grid-cols-[1.4fr_1fr] md:gap-12">
        <FotoDelLook look={look} activo={indice} onElegir={setIndice} />

        {/* Arranca más abajo que la foto del look, a propósito. El escalonado
            evita que las dos columnas se lean como un bloque simétrico y deja
            claro cuál manda: la de la izquierda es el conjunto, esta es el
            vistazo a una prenda. Solo en desktop; apiladas no hay desfase que
            hacer. */}
        <div className="md:mt-24">
          {/* La key fuerza una instancia nueva al cambiar de prenda. Sin ella
              React reutiliza la misma y el color elegido queda pegado del
              ítem anterior: se tocaba otro punto y la tarjeta no cambiaba. */}
          <TarjetaPrenda key={item.producto.id} item={item} />

          {look.items.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {look.items.map((it, i) => (
                <button
                  key={it.producto.id}
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-label={`Ver ${it.producto.nombre}`}
                  aria-current={i === indice}
                  className={`h-2 rounded-full transition-all ${
                    i === indice ? "w-6 bg-carbon" : "w-2 bg-linea hover:bg-rosa"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Foto grande con la etiqueta vertical y un punto por prenda ubicada. */
function FotoDelLook({
  look,
  activo,
  onElegir,
}: {
  look: Look;
  activo: number;
  onElegir: (i: number) => void;
}) {
  return (
    <div className="relative flex">
      {look.etiqueta && (
        // Texto vertical corrido por el borde izquierdo, como en la referencia.
        <p
          aria-hidden
          // Sin text-align el texto se ancla al inicio del eje de línea que,
          // con el rotate(180deg), cae abajo: la marca arranca en el pie de la
          // foto y sube. Centrada perdía la lectura de abajo hacia arriba.
          className="hidden shrink-0 select-none overflow-hidden text-3xl font-extrabold uppercase leading-none tracking-tight text-carbon md:block lg:text-4xl xl:text-5xl"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {look.etiqueta}
        </p>
      )}

      {/* Deliberadamente más alta que la tarjeta de la derecha: esta es la foto
          del conjunto completo y manda en la sección; la otra es una prenda
          suelta. La altura va atada a la ventana y no a la proporción, porque
          con 3/4 fijo la sección no entraba en pantalla de laptop. */}
      <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-rosa-suave/20 md:aspect-auto md:h-[58vh] md:min-h-[400px]">
        <Image
          src={look.imagen_url}
          alt={look.titulo}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover"
        />

        {look.items.map((it, i) =>
          it.posX !== null && it.posY !== null ? (
            <button
              key={it.producto.id}
              type="button"
              onClick={() => onElegir(i)}
              aria-label={`Ver ${it.producto.nombre}`}
              aria-current={i === activo}
              className={`absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 shadow-md transition ${
                i === activo
                  ? "scale-110 bg-white"
                  : "bg-white/60 hover:bg-white/90"
              }`}
              style={{ left: `${it.posX}%`, top: `${it.posY}%` }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

/**
 * Tarjeta de una prenda del conjunto.
 *
 * Dos comportamientos: al pasar el cursor se cambia a la segunda foto —la de
 * la prenda sola, sin modelo— y al tocar un punto de color se cambia a esa
 * variante, con su foto, su precio y su enlace propios.
 */
function TarjetaPrenda({ item }: { item: ItemLook }) {
  const [variante, setVariante] = useState<ProductoPublico>(item.producto);
  const [encima, setEncima] = useState(false);

  // La segunda foto es la del hover. Sin ella no hay cambio y no pasa nada.
  const fotoHover = variante.imagenes[0] ?? null;
  const fotoActual =
    encima && fotoHover ? fotoHover : variante.imagen_url ?? fotoHover;

  const hayVariantes = item.variantes.length > 1;

  return (
    <div>
      <Link
        href={`/producto/${variante.id}`}
        className="group relative block aspect-[3/4] overflow-hidden bg-rosa-suave/20 md:aspect-auto md:h-[42vh] md:min-h-[300px]"
        onMouseEnter={() => setEncima(true)}
        onMouseLeave={() => setEncima(false)}
      >
        {fotoActual && (
          <Image
            key={fotoActual}
            src={fotoActual}
            alt={variante.nombre}
            fill
            sizes="(max-width: 768px) 100vw, 35vw"
            className="object-cover transition-opacity duration-300"
          />
        )}

        {!variante.disponible ? (
          <span className="absolute left-3 top-3 bg-carbon/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
            Agotado
          </span>
        ) : (
          esNueva(variante.created_at) && (
            <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-carbon">
              Nuevo ingreso
            </span>
          )
        )}
      </Link>

      <p className="mt-4 text-center text-sm uppercase tracking-[0.1em] text-carbon">
        {variante.nombre}
      </p>
      <p className="mt-1 text-center text-sm text-carbon-suave">
        {formatSoles(variante.precio_venta)}
      </p>

      {hayVariantes && (
        <div
          className="mt-4 flex justify-center gap-2.5"
          role="group"
          aria-label="Colores disponibles"
        >
          {item.variantes.map((v) => {
            const color = resolverColor(v.color_principal, v.color_hex);
            const activa = v.id === variante.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariante(v)}
                aria-pressed={activa}
                aria-label={v.color_principal}
                title={v.color_principal}
                className={`h-6 w-6 rounded-full transition ${
                  activa
                    ? "ring-2 ring-carbon ring-offset-2"
                    : "hover:ring-1 hover:ring-linea hover:ring-offset-2"
                } ${color && esColorClaro(color) ? "border border-linea" : ""}`}
                style={{ backgroundColor: color ?? "#e5e0dc" }}
              />
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href={`/producto/${variante.id}`}
          className="inline-block bg-carbon px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-carbon/85"
        >
          Ver producto
        </Link>
      </div>
    </div>
  );
}
