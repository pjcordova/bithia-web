"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { CATEGORIAS } from "@/lib/categorias";
import { AnnouncementBar } from "@/components/AnnouncementBar";

/** Enlaces sueltos del nav, además del desplegable de categorías. */
const ENLACES = [
  { href: "/catalogo", label: "Nuevas esta semana" },
  { href: "/catalogo", label: "Ver todo" },
];

function hrefCategoria(nombre: string) {
  return `/catalogo?categoria=${encodeURIComponent(nombre)}`;
}

export function Header() {
  const [menuMovil, setMenuMovil] = useState(false);
  const [desplegable, setDesplegable] = useState(false);
  const { cantidadTotal, listo } = useCart();
  const zonaCategorias = useRef<HTMLDivElement>(null);

  // El desplegable se cierra al hacer clic fuera o con Escape: en desktop se
  // abre al pasar el mouse y quedaría colgado si solo dependiera del hover.
  useEffect(() => {
    if (!desplegable) return;

    function fuera(e: MouseEvent) {
      if (!zonaCategorias.current?.contains(e.target as Node)) {
        setDesplegable(false);
      }
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setDesplegable(false);
    }

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [desplegable]);

  return (
    <>
      {/* Fuera del sticky a propósito: la barra se va al hacer scroll y no
          roba altura permanente en celular, donde el header ya ocupa dos filas. */}
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-linea bg-crema/95 backdrop-blur">
      {/* ---------- Móvil: hamburguesa · logo centrado · acciones ---------- */}
      <div className="flex h-14 items-center px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMenuMovil((v) => !v)}
          className="-ml-2 rounded-lg p-2 text-carbon transition hover:bg-rosa-suave/50"
          aria-label={menuMovil ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuMovil}
        >
          {menuMovil ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-base font-semibold uppercase tracking-[0.2em] text-terracota-oscuro"
        >
          Bithia
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <IconoBuscar />
          <IconoCarrito cantidad={cantidadTotal} visible={listo} />
        </div>
      </div>

      {/* Nav horizontal desplazable, como el de Luvaro en celular */}
      <nav
        className="ocultar-scrollbar flex gap-5 overflow-x-auto border-t border-linea px-4 py-2.5 md:hidden"
        aria-label="Categorías"
      >
        {CATEGORIAS.map((c) => (
          <Link
            key={c.nombre}
            href={hrefCategoria(c.nombre)}
            className="shrink-0 text-[11px] font-medium uppercase tracking-[0.1em] text-carbon transition hover:text-terracota"
          >
            {c.nombre}
          </Link>
        ))}
      </nav>

      {/* ---------- Desktop: logo izquierda · nav · acciones ---------- */}
      <div className="mx-auto hidden h-16 max-w-6xl items-center gap-8 px-4 md:flex">
        <Link
          href="/"
          className="text-xl font-semibold uppercase tracking-[0.25em] text-terracota-oscuro"
        >
          Bithia
        </Link>

        <nav className="flex items-center gap-6" aria-label="Principal">
          <div
            ref={zonaCategorias}
            className="relative"
            onMouseEnter={() => setDesplegable(true)}
            onMouseLeave={() => setDesplegable(false)}
          >
            <button
              type="button"
              onClick={() => setDesplegable((v) => !v)}
              aria-expanded={desplegable}
              aria-haspopup="true"
              className="flex items-center gap-1 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-carbon transition hover:text-terracota"
            >
              Categorías
              <ChevronDown
                size={13}
                className={`transition ${desplegable ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>

            {desplegable && (
              // Panel sobrio, sin fotos ni columnas: la gracia del de Luvaro
              // es que no compite con el hero.
              <div className="absolute left-0 top-full w-60 border border-linea bg-white py-2 shadow-lg">
                {CATEGORIAS.map((c) => (
                  <Link
                    key={c.nombre}
                    href={hrefCategoria(c.nombre)}
                    onClick={() => setDesplegable(false)}
                    className="block px-5 py-2.5 text-sm text-carbon transition hover:bg-rosa-suave/40 hover:text-terracota-oscuro"
                  >
                    {c.nombre}
                  </Link>
                ))}
                <div className="my-1 border-t border-linea" />
                <Link
                  href="/catalogo"
                  onClick={() => setDesplegable(false)}
                  className="block px-5 py-2.5 text-sm font-semibold text-terracota-oscuro transition hover:bg-rosa-suave/40"
                >
                  Ver todo
                </Link>
              </div>
            )}
          </div>

          {ENLACES.map((e) => (
            <Link
              key={e.label}
              href={e.href}
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-carbon transition hover:text-terracota"
            >
              {e.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <IconoBuscar />
          <IconoCarrito cantidad={cantidadTotal} visible={listo} />
        </div>
      </div>

      {/* ---------- Panel del menú móvil ---------- */}
      {menuMovil && (
        <div className="border-t border-linea bg-crema px-4 py-3 md:hidden">
          <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-rosa">
            Categorías
          </p>
          {CATEGORIAS.map((c) => (
            <Link
              key={c.nombre}
              href={hrefCategoria(c.nombre)}
              onClick={() => setMenuMovil(false)}
              className="block rounded-lg px-2 py-3 text-sm text-carbon transition hover:bg-rosa-suave/40"
            >
              {c.nombre}
            </Link>
          ))}
          <div className="my-2 border-t border-linea" />
          <Link
            href="/catalogo"
            onClick={() => setMenuMovil(false)}
            className="block rounded-lg px-2 py-3 text-sm font-semibold text-terracota-oscuro transition hover:bg-rosa-suave/40"
          >
            Ver todo el catálogo
          </Link>
          <Link
            href="/carrito"
            onClick={() => setMenuMovil(false)}
            className="block rounded-lg px-2 py-3 text-sm text-carbon transition hover:bg-rosa-suave/40"
          >
            Mi carrito
          </Link>
        </div>
      )}
      </header>
    </>
  );
}

function IconoBuscar() {
  return (
    <Link
      href="/catalogo"
      className="rounded-lg p-2 text-carbon transition hover:bg-rosa-suave/50 hover:text-terracota"
      aria-label="Buscar prendas"
    >
      <Search size={20} />
    </Link>
  );
}

function IconoCarrito({
  cantidad,
  visible,
}: {
  cantidad: number;
  visible: boolean;
}) {
  return (
    <Link
      href="/carrito"
      className="relative rounded-lg p-2 text-terracota-oscuro transition hover:bg-rosa-suave/50"
      aria-label={`Mi carrito${visible && cantidad > 0 ? `, ${cantidad} prendas` : ""}`}
    >
      <ShoppingBag size={20} />
      {visible && cantidad > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracota px-1 text-[10px] font-bold text-white">
          {cantidad}
        </span>
      )}
    </Link>
  );
}
