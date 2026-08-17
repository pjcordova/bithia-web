"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { HERO_INTERVALO_MS, SLIDES } from "@/lib/contenido";

/**
 * Destinos de la flecha, en orden de preferencia. "destacados" no se renderiza
 * si la dueña todavía no marcó ninguna prenda, así que hay respaldo: la flecha
 * nunca debe apuntar a una sección inexistente.
 */
const DESTINOS_FLECHA = ["destacados", "novedades"];

export function Hero() {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const reducirMovimiento = useRef(false);

  useEffect(() => {
    reducirMovimiento.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (SLIDES.length < 2 || pausado || reducirMovimiento.current) return;
    const id = setInterval(
      () => setActual((i) => (i + 1) % SLIDES.length),
      HERO_INTERVALO_MS
    );
    return () => clearInterval(id);
  }, [pausado, actual]);

  const bajar = useCallback(() => {
    for (const id of DESTINOS_FLECHA) {
      const destino = document.getElementById(id);
      if (destino) {
        destino.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
  }, []);

  return (
    <section
      className="relative -mx-4 h-[78vh] min-h-[460px] overflow-hidden md:mx-0 md:h-[80vh] md:rounded-tarjeta"
      // Pausa mientras la clienta lee: nada más molesto que un carrusel que
      // cambia justo cuando ibas a tocar el botón.
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={() => setPausado(true)}
      aria-roledescription="carrusel"
      aria-label="Destacados de Bithia Brand"
    >
      {SLIDES.map((slide, i) => {
        const visible = i === actual;
        return (
          <div
            key={slide.titulo}
            className={`absolute inset-0 transition-opacity duration-700 ${
              visible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!visible}
          >
            {slide.imagen ? (
              <>
                <Image
                  src={slide.imagen}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-carbon"
                  style={{ opacity: slide.velo ?? 0.25 }}
                />
              </>
            ) : (
              // Sin foto todavía: degradado de marca en vez de un hueco gris.
              <div className="absolute inset-0 bg-gradient-to-br from-rosa-suave via-rosa-suave/60 to-terracota/30" />
            )}

            <div className="relative flex h-full items-center">
              <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
                <div className="max-w-lg">
                  {slide.etiqueta && (
                    <span
                      className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        slide.imagen
                          ? "bg-white/90 text-carbon"
                          : "bg-white/80 text-terracota-oscuro"
                      }`}
                    >
                      {slide.etiqueta}
                    </span>
                  )}
                  <h1
                    className={`mt-5 text-3xl font-semibold uppercase leading-[1.1] tracking-[0.04em] md:text-5xl ${
                      slide.imagen ? "text-white" : "text-carbon"
                    }`}
                  >
                    {slide.titulo}
                  </h1>
                  {slide.subtitulo && (
                    <p
                      className={`mt-4 max-w-md text-sm leading-relaxed md:text-base ${
                        slide.imagen ? "text-white/90" : "text-carbon-suave"
                      }`}
                    >
                      {slide.subtitulo}
                    </p>
                  )}
                  <Link
                    href={slide.cta.href}
                    tabIndex={visible ? 0 : -1}
                    className="mt-8 inline-block bg-terracota px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-terracota-oscuro"
                  >
                    {slide.cta.texto}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Puntos abajo a la derecha, uno por slide y clickeables */}
      {SLIDES.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2.5 md:bottom-8 md:right-10">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.titulo}
              type="button"
              onClick={() => setActual(i)}
              aria-label={`Ver ${slide.titulo}`}
              aria-current={i === actual}
              className={`h-2.5 w-2.5 rounded-full border border-carbon/40 transition ${
                i === actual ? "bg-carbon" : "bg-transparent hover:bg-carbon/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Flecha que baja a novedades */}
      <button
        type="button"
        onClick={bajar}
        aria-label="Ver las prendas nuevas"
        className="absolute bottom-0 left-1/2 flex h-12 w-12 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-white text-carbon shadow-lg transition hover:bg-crema"
      >
        <ChevronDown size={22} />
      </button>
    </section>
  );
}
