"use client";

import { useEffect, useState } from "react";
import { ANUNCIOS } from "@/lib/contenido";

const INTERVALO_MS = 4500;

/**
 * Barra fija sobre el header, al estilo de las tiendas peruanas de moda.
 * Rota entre mensajes en vez de mostrarlos todos: una sola frase se lee,
 * tres apiladas se ignoran.
 */
export function AnnouncementBar() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (ANUNCIOS.length < 2) return;

    // Quien pidió menos movimiento en su sistema ve solo el primer mensaje.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = setInterval(
      () => setIndice((i) => (i + 1) % ANUNCIOS.length),
      INTERVALO_MS
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-carbon text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center px-4">
        <p
          key={indice}
          className="animate-[desvanecer_0.5s_ease] text-center text-[11px] font-medium uppercase tracking-[0.12em] md:text-xs"
        >
          {ANUNCIOS[indice]}
        </p>
      </div>
    </div>
  );
}
