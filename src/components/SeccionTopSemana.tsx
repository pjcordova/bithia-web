"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import type { ProductoPublico } from "@/lib/productos";
import { useCart } from "@/lib/cart-store";
import { formatSoles } from "@/lib/format";
import { TALLAS } from "@/lib/categorias";
import { PuntoColor } from "@/components/PuntoColor";

/**
 * Prenda destacada de la semana: galería deslizable a la izquierda y compra a
 * la derecha.
 *
 * La referencia usa una cuadrícula 2x2 de fotos. Aquí es un deslizable a
 * propósito: en cuadrícula las cuatro fotos se ven a la vez y ninguna manda,
 * mientras que el deslizable muestra una grande por turno y sostiene la
 * atención en la prenda.
 */
export function SeccionTopSemana({
  producto,
}: {
  producto: ProductoPublico | null;
}) {
  const router = useRouter();
  const { agregar } = useCart();
  const pista = useRef<HTMLDivElement>(null);

  const [indice, setIndice] = useState(0);
  const [talla, setTalla] = useState<string | null>(
    producto?.tallas.length === 1 ? producto.tallas[0] : null
  );

  const medidasDeTalla = useMemo(
    () => producto?.medidas.find((m) => m.talla === talla) ?? null,
    [producto, talla]
  );

  // El índice lo fija SOLO el scroll. Si irA también lo fijara, los dos se
  // pisarían mientras dura el desplazamiento suave —onScroll sigue disparando
  // durante la animación— y el punto resaltado quedaría peleado con el real.
  const irA = useCallback((i: number) => {
    const el = pista.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  }, []);

  const alDesplazar = useCallback(() => {
    const el = pista.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndice((actual) => (actual === i ? actual : i));
  }, []);

  if (!producto || producto.galeria.length === 0) return null;

  const agotado = !producto.disponible;
  const total = producto.galeria.length;

  function alCarrito(irAlCarrito: boolean) {
    if (!producto || !talla || agotado) return;
    agregar({
      productoId: producto.id,
      codigoLote: producto.codigo_lote,
      nombre: producto.nombre,
      talla,
      precio: producto.precio_venta,
      cantidad: 1,
      imagenUrl: producto.imagen_url,
    });
    router.push(irAlCarrito ? "/carrito" : `/producto/${producto.id}`);
  }

  return (
    <section className="mt-20" aria-labelledby="top-semana">
      <p className="text-center text-[11px] uppercase tracking-[0.18em] text-carbon-suave">
        <span className="font-bold text-carbon">Diseño top</span> de esta semana
      </p>
      <h2
        id="top-semana"
        className="mt-3 text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl"
      >
        Top de la semana
      </h2>

      <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:gap-14">
        {/* ---------- Galería deslizable ----------
            En desktop la foto se estira hasta igualar la altura de la columna
            de datos, que termina en la referencia de tallas. Con proporción
            fija quedaba un hueco debajo. El min-h evita el caso inverso: si la
            prenda no tiene descripción ni material, la columna derecha es
            corta y la foto se achicaría demasiado. */}
        <div className="md:flex md:h-full md:flex-col">
          <div className="relative md:min-h-[520px] md:flex-1">
            <div
              ref={pista}
              onScroll={alDesplazar}
              className="ocultar-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto rounded-tarjeta"
              aria-roledescription="carrusel"
              aria-label={`Fotos de ${producto.nombre}`}
            >
            {producto.galeria.map((url, i) => (
              <div
                key={url + i}
                className="relative aspect-[3/4] w-full shrink-0 snap-center bg-rosa-suave/25 md:aspect-auto md:h-full"
              >
                <Image
                  src={url}
                  alt={
                    i === 0
                      ? producto.nombre
                      : `${producto.nombre}, foto ${i + 1} de ${total}`
                  }
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
            </div>

            {/* Las flechas van en esta caja, no en la columna entera: así
                quedan centradas sobre la foto y no sobre foto más puntos. */}
            {total > 1 && (
              <>
                <FlechaGaleria
                  lado="izquierda"
                  visible={indice > 0}
                  onClick={() => irA(indice - 1)}
                />
                <FlechaGaleria
                  lado="derecha"
                  visible={indice < total - 1}
                  onClick={() => irA(indice + 1)}
                />
              </>
            )}
          </div>

          {total > 1 && (
            <>
              <div className="mt-4 flex shrink-0 justify-center gap-2">
                {producto.galeria.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => irA(i)}
                    aria-label={`Ver foto ${i + 1} de ${total}`}
                    aria-current={i === indice}
                    className={`h-1.5 rounded-full transition-all ${
                      i === indice
                        ? "w-6 bg-terracota"
                        : "w-1.5 bg-linea hover:bg-rosa"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ---------- Compra ---------- */}
        <div className="md:pt-4">
          <h3 className="text-lg font-medium uppercase tracking-[0.1em] text-carbon md:text-xl">
            {producto.nombre}
          </h3>
          <p className="mt-3 text-lg tracking-[0.05em] text-carbon-suave">
            {formatSoles(producto.precio_venta)}
          </p>

          <div className="mt-6">
            <p className="text-sm text-carbon">Color:</p>
            <div className="mt-2">
              <PuntoColor
                nombre={producto.color_principal}
                hex={producto.color_hex}
                conNombre
                tamano="md"
              />
            </div>
          </div>

          <p className="mt-6 text-sm text-carbon">Talla:</p>
          <div className="mt-3 flex gap-2">
            {TALLAS.map((t) => {
              const existe = producto.tallas.includes(t);
              const activa = talla === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!existe || agotado}
                  aria-pressed={activa}
                  onClick={() => setTalla(t)}
                  className={`h-10 w-10 border text-xs font-medium transition ${
                    activa
                      ? "border-carbon bg-carbon text-white"
                      : existe && !agotado
                        ? "border-linea bg-white text-carbon hover:border-carbon"
                        : "cursor-not-allowed border-linea bg-white text-linea"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <TablaMedidas
            medidas={medidasDeTalla}
            talla={talla}
            hayAlguna={producto.medidas.some(
              (m) => m.busto_cm || m.cintura_cm || m.cadera_cm || m.largo_cm
            )}
          />

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => alCarrito(false)}
              disabled={agotado || !talla}
              className="w-full border border-carbon py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-carbon transition hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
            >
              Añadir al carrito
            </button>
            <button
              type="button"
              onClick={() => alCarrito(true)}
              disabled={agotado || !talla}
              className="flex w-full items-center justify-center gap-2 bg-carbon py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-carbon/85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart size={15} aria-hidden />
              Pedir por WhatsApp
            </button>
          </div>

          {agotado ? (
            <p className="mt-3 text-center text-xs uppercase tracking-[0.1em] text-rosa">
              Agotada por ahora
            </p>
          ) : (
            !talla && (
              <p className="mt-3 text-center text-xs text-rosa">
                Elige una talla para continuar.
              </p>
            )
          )}

          {producto.descripcion && (
            <div className="mt-8 border-t border-linea pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-carbon">
                Descripción
              </p>
              <p className="mt-3 text-sm leading-relaxed text-carbon-suave">
                {producto.descripcion}
              </p>
            </div>
          )}

          {producto.material && (
            <p className="mt-4 text-sm leading-relaxed text-carbon-suave">
              <span className="font-semibold text-carbon">Material: </span>
              {producto.material}
            </p>
          )}

          {producto.referencia_modelo && (
            <p className="mt-4 text-sm leading-relaxed text-carbon-suave">
              <span className="font-semibold text-carbon">
                Referencia de tallas:{" "}
              </span>
              {producto.referencia_modelo}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Medidas de la prenda para la talla elegida. Solo se muestran las cargadas:
 * una fila con guiones no ayuda a decidir y resta confianza al resto.
 */
function TablaMedidas({
  medidas,
  talla,
  hayAlguna,
}: {
  medidas: {
    busto_cm: number | null;
    cintura_cm: number | null;
    cadera_cm: number | null;
    largo_cm: number | null;
  } | null;
  talla: string | null;
  hayAlguna: boolean;
}) {
  if (!hayAlguna) return null;

  if (!talla) {
    return (
      <p className="mt-4 text-xs text-carbon-suave">
        Elige una talla para ver sus medidas.
      </p>
    );
  }

  const filas = [
    { etiqueta: "Busto", valor: medidas?.busto_cm },
    { etiqueta: "Cintura", valor: medidas?.cintura_cm },
    { etiqueta: "Cadera", valor: medidas?.cadera_cm },
    { etiqueta: "Largo", valor: medidas?.largo_cm },
  ].filter((f) => typeof f.valor === "number");

  if (filas.length === 0) {
    return (
      <p className="mt-4 text-xs text-carbon-suave">
        Todavía no cargamos las medidas de la talla {talla}. Escríbenos y te las
        pasamos.
      </p>
    );
  }

  return (
    <div className="mt-5 bg-crema p-4" aria-live="polite">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-carbon">
        Medidas de la prenda · Talla {talla}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {filas.map((f) => (
          <div key={f.etiqueta} className="flex justify-between border-b border-linea pb-1">
            <dt className="text-carbon-suave">{f.etiqueta}</dt>
            <dd className="font-medium text-carbon">{f.valor} cm</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-carbon-suave">
        Medidas de la prenda extendida, no del cuerpo. Son referenciales y
        pueden variar hasta 2 cm entre unidades.
      </p>
    </div>
  );
}

function FlechaGaleria({
  lado,
  visible,
  onClick,
}: {
  lado: "izquierda" | "derecha";
  visible: boolean;
  onClick: () => void;
}) {
  const esIzq = lado === "izquierda";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={esIzq ? "Foto anterior" : "Foto siguiente"}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-carbon shadow-md transition hover:bg-white ${
        esIzq ? "left-3" : "right-3"
      } ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      {esIzq ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );
}
