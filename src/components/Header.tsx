"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/carrito", label: "Mi carrito" },
];

export function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { cantidadTotal, listo } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-crema/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          className="-ml-2 rounded-lg p-2 text-carbon transition hover:bg-rosa-suave/50 md:hidden"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="hidden gap-6 md:flex">
          {ENLACES.slice(0, 2).map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-medium text-carbon transition hover:text-terracota"
            >
              {e.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold tracking-tight text-terracota-oscuro"
        >
          Bithia Brand
        </Link>

        <Link
          href="/carrito"
          className="relative -mr-2 rounded-lg p-2 text-terracota-oscuro transition hover:bg-rosa-suave/50"
          aria-label={`Mi carrito${listo && cantidadTotal > 0 ? `, ${cantidadTotal} prendas` : ""}`}
        >
          <ShoppingBag size={22} />
          {listo && cantidadTotal > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracota px-1 text-[11px] font-bold text-white">
              {cantidadTotal}
            </span>
          )}
        </Link>
      </div>

      {menuAbierto && (
        <nav className="border-t border-linea bg-crema px-4 py-2 md:hidden">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setMenuAbierto(false)}
              className="block rounded-lg px-2 py-3 text-sm font-medium text-carbon transition hover:bg-rosa-suave/40"
            >
              {e.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
