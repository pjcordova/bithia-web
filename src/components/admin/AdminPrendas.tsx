"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { EyeOff, Pencil, Plus, Search } from "lucide-react";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import { formatSoles } from "@/lib/format";
import { NOMBRES_CATEGORIA } from "@/lib/categorias";

const TODAS = "Todas";

/** Ignora tildes y mayúsculas, igual que el buscador del catálogo público. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Inventario: la lista de prendas como lista, no como portada.
 *
 * Es la diferencia de fondo con la vista previa. Allá las prendas aparecen
 * donde caen en la web, y una misma sale varias veces; acá cada prenda
 * aparece una sola vez y lleva escrito en qué lugares de la portada se la
 * está viendo. Esa línea es la que faltaba: sin ella se editaba una foto
 * creyendo tocar un solo sitio y cambiaba en tres más.
 */
export function AdminPrendas({
  productos,
  ubicaciones,
  onEditar,
  onAgregar,
}: {
  productos: ProductoAdmin[];
  ubicaciones: Map<string, string[]>;
  onEditar: (producto: ProductoAdmin) => void;
  onAgregar: () => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string>(TODAS);

  const categorias = useMemo(() => {
    const presentes = new Set(productos.map((p) => p.categoria));
    return [TODAS, ...NOMBRES_CATEGORIA.filter((c) => presentes.has(c))];
  }, [productos]);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return productos.filter((p) => {
      if (categoria !== TODAS && p.categoria !== categoria) return false;
      if (!q) return true;
      return (
        normalizar(p.nombre).includes(q) ||
        normalizar(p.codigo_lote).includes(q) ||
        normalizar(p.color_principal).includes(q)
      );
    });
  }, [productos, busqueda, categoria]);

  const ocultas = productos.filter((p) => !p.visible_en_tienda).length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-carbon">Prendas</h2>
          <p className="mt-1 text-sm text-carbon-suave">
            {productos.length}{" "}
            {productos.length === 1 ? "prenda" : "prendas"} en total
            {ocultas > 0 && ` · ${ocultas} sin publicar`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAgregar}
          className="flex items-center gap-1.5 rounded-lg bg-terracota px-4 py-2.5 text-sm font-bold text-white transition hover:bg-terracota-oscuro"
        >
          <Plus size={16} />
          Agregar prenda
        </button>
      </div>

      <div className="mt-5">
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
            placeholder="Buscar por nombre, código o color..."
            aria-label="Buscar prendas"
            className="w-full rounded-lg border border-linea bg-white py-2.5 pl-10 pr-3 text-sm text-carbon outline-none focus:border-terracota"
          />
        </div>

        <div className="ocultar-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              aria-pressed={categoria === c}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                categoria === c
                  ? "bg-terracota text-white"
                  : "bg-white text-carbon hover:bg-rosa-suave/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="mt-8 rounded-tarjeta bg-white p-8 text-center text-sm text-carbon-suave sombra-tarjeta">
          Ninguna prenda coincide con lo que buscas.
        </p>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {visibles.map((p) => (
            <FilaPrenda
              key={p.id}
              producto={p}
              donde={ubicaciones.get(p.id) ?? []}
              onEditar={onEditar}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function FilaPrenda({
  producto,
  donde,
  onEditar,
}: {
  producto: ProductoAdmin;
  donde: string[];
  onEditar: (producto: ProductoAdmin) => void;
}) {
  const oculta = !producto.visible_en_tienda;

  return (
    <li>
      <button
        type="button"
        onClick={() => onEditar(producto)}
        aria-label={`Editar ${producto.nombre}, ${producto.codigo_lote}`}
        className="group flex w-full items-start gap-3.5 rounded-tarjeta bg-white p-3 text-left sombra-tarjeta transition hover:shadow-lg"
      >
        <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-lg bg-rosa-suave/30">
          {producto.imagen_url ? (
            <Image
              src={producto.imagen_url}
              alt=""
              fill
              sizes="72px"
              className={`object-cover ${oculta ? "opacity-40 grayscale" : ""}`}
            />
          ) : (
            <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-carbon-suave">
              Sin foto
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-carbon">
              {producto.nombre}
            </p>
            <Pencil
              size={15}
              className="mt-0.5 shrink-0 text-carbon-suave transition group-hover:text-terracota"
              aria-hidden
            />
          </div>

          <p className="mt-0.5 text-xs text-carbon-suave">
            {producto.categoria} · {producto.codigo_lote} ·{" "}
            {formatSoles(producto.precio_venta)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {oculta && (
              <span className="flex items-center gap-1 rounded-full bg-carbon/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <EyeOff size={11} />
                Sin publicar
              </span>
            )}
            {!producto.disponible && !oculta && (
              <span className="rounded-full bg-carbon/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Agotado
              </span>
            )}
          </div>

          {/* El dato que faltaba. Sin publicar no se muestra en ningún lado,
              así que decir "aparece en" seria mentira. */}
          {!oculta && (
            <p className="mt-2 text-xs leading-relaxed">
              {donde.length === 0 ? (
                <span className="text-carbon-suave">
                  Solo en el catálogo
                </span>
              ) : (
                <>
                  <span className="text-carbon-suave">
                    En la portada aparece en{" "}
                  </span>
                  <span className="font-semibold text-terracota-oscuro">
                    {donde.join(" · ")}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      </button>
    </li>
  );
}
