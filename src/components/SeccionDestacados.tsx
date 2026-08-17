"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { ProductoPublico } from "@/lib/productos";

/**
 * Fila horizontal desplazable, al estilo de "Best sellers this season".
 * Se usa scroll nativo con scroll-snap en vez de un carrusel por índice: en
 * celular el arrastre con el dedo tiene que funcionar igual que en cualquier
 * otra tienda, y las flechas son solo un atajo para desktop.
 */
export function SeccionDestacados({
  productos,
  titulo = "Los más pedidos",
  href = "/catalogo",
  textoCta = "Ver todo el catálogo",
  id,
}: {
  productos: ProductoPublico[];
  titulo?: string;
  href?: string;
  textoCta?: string;
  id?: string;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const [puedeIzq, setPuedeIzq] = useState(false);
  const [puedeDer, setPuedeDer] = useState(false);

  const revisarBordes = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    setPuedeIzq(el.scrollLeft > 8);
    setPuedeDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    revisarBordes();
    window.addEventListener("resize", revisarBordes);
    return () => window.removeEventListener("resize", revisarBordes);
  }, [revisarBordes, productos.length]);

  const mover = useCallback((dir: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    // Avanza una tarjeta y un poco más, para que se asome la siguiente y
    // quede claro que hay más contenido.
    const paso = el.clientWidth * 0.8;
    el.scrollBy({ left: paso * dir, behavior: "smooth" });
  }, []);

  if (productos.length === 0) return null;

  return (
    <section id={id} className="mt-20 scroll-mt-24">
      <h2 className="text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl">
        {titulo}
      </h2>

      <div className="relative mt-8">
        <div
          ref={pista}
          onScroll={revisarBordes}
          className="ocultar-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 md:mx-0 md:px-0"
        >
          {productos.map((p) => (
            <div
              key={p.id}
              className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]"
            >
              <ProductCard producto={p} />
            </div>
          ))}
        </div>

        {/* Flechas solo en desktop: en celular se arrastra con el dedo. */}
        <FlechaPista
          lado="izquierda"
          visible={puedeIzq}
          onClick={() => mover(-1)}
        />
        <FlechaPista
          lado="derecha"
          visible={puedeDer}
          onClick={() => mover(1)}
        />
      </div>

      <div className="mt-10 text-center">
        <Link
          href={href}
          className="inline-block bg-carbon px-10 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-carbon/85"
        >
          {textoCta}
        </Link>
      </div>
    </section>
  );
}

function FlechaPista({
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
      // Se oculta al llegar al borde en vez de deshabilitarse: una flecha
      // apagada invita a tocarla igual.
      className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-carbon shadow-lg transition hover:bg-crema md:flex ${
        esIzq ? "-left-5" : "-right-5"
      } ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      aria-label={esIzq ? "Ver anteriores" : "Ver siguientes"}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      {esIzq ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}
