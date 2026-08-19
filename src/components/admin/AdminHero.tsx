"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { HERO_INTERVALO_MS } from "@/lib/contenido";
import type { HeroSlide } from "@/lib/hero";

/**
 * Calco de <Hero> (mismo carrusel, mismas diapositivas, mismo auto-avance)
 * pero con cada diapositiva editable: el botón de la clienta ("Ver catálogo",
 * etc.) se reemplaza por uno de "Editar esta diapositiva", y se agrega uno
 * para crear una nueva. Antes esto solo se podía tocar editando código
 * directamente — de ahí la confusión.
 */
export function AdminHero({
  slides,
  onEditar,
  onAgregar,
}: {
  slides: HeroSlide[];
  onEditar: (slide: HeroSlide) => void;
  onAgregar: () => void;
}) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || pausado) return;
    const id = setInterval(
      () => setActual((i) => (i + 1) % slides.length),
      HERO_INTERVALO_MS
    );
    return () => clearInterval(id);
  }, [pausado, actual, slides.length]);

  const irA = useCallback((i: number) => setActual(i), []);

  if (slides.length === 0) {
    return (
      <section className="relative flex h-[50vh] min-h-[320px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-rosa-suave via-rosa-suave/60 to-terracota/30 text-center">
        <p className="text-sm text-carbon">
          Todavía no hay diapositivas en el carrusel de portada.
        </p>
        <button
          type="button"
          onClick={onAgregar}
          className="inline-flex items-center gap-1.5 rounded-full bg-terracota px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-terracota-oscuro"
        >
          <Plus size={16} aria-hidden />
          Agregar diapositiva
        </button>
      </section>
    );
  }

  return (
    <div className="relative">
      <section
        className="relative h-[78vh] min-h-[460px] overflow-hidden md:h-[85vh]"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onTouchStart={() => setPausado(true)}
      >
        {slides.map((s, i) => {
          const visible = i === actual;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onEditar(s)}
              aria-label={`Editar diapositiva: ${s.titulo}`}
              className={`group absolute inset-0 w-full text-left transition-opacity duration-700 ${
                visible ? "opacity-100" : "pointer-events-none opacity-0"
              } ${!s.activo ? "saturate-50" : ""}`}
            >
              {s.imagen_url ? (
                <>
                  <Image
                    src={s.imagen_url}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-carbon"
                    style={{ opacity: s.velo ?? 0.25 }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-rosa-suave via-rosa-suave/60 to-terracota/30" />
              )}

              {!s.activo && (
                <span className="absolute left-4 top-4 rounded-md bg-carbon/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Inactiva
                </span>
              )}

              <div className="relative flex h-full items-center">
                <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
                  <div className="max-w-lg">
                    {s.etiqueta && (
                      <span
                        className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                          s.imagen_url
                            ? "bg-white/90 text-carbon"
                            : "bg-white/80 text-terracota-oscuro"
                        }`}
                      >
                        {s.etiqueta}
                      </span>
                    )}
                    <h1
                      className={`mt-5 text-3xl font-semibold uppercase leading-[1.1] tracking-[0.04em] md:text-5xl ${
                        s.imagen_url ? "text-white" : "text-carbon"
                      }`}
                    >
                      {s.titulo}
                    </h1>
                    {s.subtitulo && (
                      <p
                        className={`mt-4 max-w-md text-sm leading-relaxed md:text-base ${
                          s.imagen_url ? "text-white/90" : "text-carbon-suave"
                        }`}
                      >
                        {s.subtitulo}
                      </p>
                    )}
                    <span className="mt-8 inline-flex items-center gap-2 bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-carbon opacity-0 shadow-lg transition group-hover:opacity-100">
                      <Pencil size={13} />
                      Editar esta diapositiva
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        <div className="absolute bottom-6 right-6 flex items-center gap-3 md:bottom-8 md:right-10">
          <button
            type="button"
            onClick={onAgregar}
            aria-label="Agregar diapositiva"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-carbon shadow-lg transition hover:bg-crema"
          >
            <Plus size={16} />
          </button>
          {slides.length > 1 && (
            <div className="flex gap-2.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => irA(i)}
                  aria-label={`Ver ${s.titulo}`}
                  aria-current={i === actual}
                  className={`h-2.5 w-2.5 rounded-full border border-white/70 transition ${
                    i === actual ? "bg-white" : "bg-transparent hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
