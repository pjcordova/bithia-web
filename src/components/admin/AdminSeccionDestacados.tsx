"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import type { ProductoAdmin } from "@/components/admin/ProductForm";

/**
 * Calco de <SeccionDestacados> (misma pista deslizable, mismas flechas) con
 * tarjetas editables en vez de links al detalle público.
 */
export function AdminSeccionDestacados({
  productos,
  titulo,
  onEditar,
}: {
  productos: ProductoAdmin[];
  titulo: string;
  onEditar: (producto: ProductoAdmin) => void;
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
    const paso = el.clientWidth * 0.8;
    el.scrollBy({ left: paso * dir, behavior: "smooth" });
  }, []);

  if (productos.length === 0) {
    return (
      <SeccionVacia titulo={titulo}>
        Ninguna prenda está marcada como “Más pedido” todavía. Márcala desde
        su formulario de edición.
      </SeccionVacia>
    );
  }

  return (
    <section className="mt-16 scroll-mt-24">
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
            <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%]">
              <AdminProductCard producto={p} onEditar={onEditar} />
            </div>
          ))}
        </div>

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
    </section>
  );
}

export function SeccionVacia({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <h2 className="text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl">
        {titulo}
      </h2>
      <p className="mx-auto mt-6 max-w-md rounded-tarjeta bg-white p-6 text-center text-sm text-carbon-suave sombra-tarjeta">
        {children}
      </p>
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
