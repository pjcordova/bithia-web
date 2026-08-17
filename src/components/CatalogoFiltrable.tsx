"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { ProductoPublico } from "@/lib/productos";
import { NOMBRES_CATEGORIA, TALLAS } from "@/lib/categorias";

const TODAS = "Todos";

/** Ignora tildes y mayúsculas: "pantalon" debe encontrar "Pantalón". */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function CatalogoFiltrable({
  productos,
}: {
  productos: ProductoPublico[];
}) {
  // El desplegable del header enlaza a /catalogo?categoria=Vestidos, así que
  // la pestaña correcta tiene que venir ya marcada al aterrizar.
  const params = useSearchParams();
  const categoriaInicial = params.get("categoria");

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string>(
    categoriaInicial && NOMBRES_CATEGORIA.includes(categoriaInicial)
      ? categoriaInicial
      : TODAS
  );
  const [talla, setTalla] = useState<string | null>(null);

  // Solo se ofrecen las categorías que realmente tienen prendas publicadas.
  const categorias = useMemo(() => {
    const presentes = new Set(productos.map((p) => p.categoria));
    return [TODAS, ...NOMBRES_CATEGORIA.filter((c) => presentes.has(c))];
  }, [productos]);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return productos.filter((p) => {
      if (categoria !== TODAS && p.categoria !== categoria) return false;
      if (talla && !p.tallas.includes(talla)) return false;
      if (!q) return true;
      return (
        normalizar(p.nombre).includes(q) ||
        normalizar(p.color_principal).includes(q) ||
        normalizar(p.categoria).includes(q)
      );
    });
  }, [productos, busqueda, categoria, talla]);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 bg-crema/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-carbon-suave"
            aria-hidden
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="w-full rounded-lg border border-linea bg-white py-2.5 pl-10 pr-4 text-sm text-carbon placeholder:text-carbon-suave focus:border-terracota focus:outline-none"
          />
        </div>

        {/* Categoría es el filtro principal: pestañas de primer nivel. */}
        <div
          className="ocultar-scrollbar mt-3 flex gap-2 overflow-x-auto"
          role="tablist"
          aria-label="Categorías"
        >
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={categoria === c}
              onClick={() => setCategoria(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                categoria === c
                  ? "bg-terracota text-white"
                  : "bg-white text-carbon hover:bg-rosa-suave/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Talla es secundaria y deliberadamente discreta. */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-xs text-carbon-suave">Talla:</span>
          {TALLAS.map((t) => {
            const activa = talla === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={activa}
                onClick={() => setTalla(activa ? null : t)}
                className={`h-6 w-6 rounded-full text-[11px] font-semibold transition ${
                  activa
                    ? "bg-terracota text-white"
                    : "bg-white text-carbon-suave hover:bg-rosa-suave/50"
                }`}
              >
                {t}
              </button>
            );
          })}
          {talla && (
            <button
              type="button"
              onClick={() => setTalla(null)}
              className="text-xs text-terracota underline"
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="mt-10 rounded-tarjeta bg-white p-8 text-center text-sm text-carbon-suave sombra-tarjeta">
          No encontramos prendas con esos filtros. Prueba con otra categoría o
          escríbenos por WhatsApp.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visibles.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </>
  );
}
