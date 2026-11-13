"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Search, X } from "lucide-react";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import { formatSoles } from "@/lib/format";

/** Ignora tildes y mayúsculas, igual que el buscador del catálogo. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Elige qué prendas ocupan un espacio de la portada, desde ese espacio.
 *
 * Reemplaza a las casillas escondidas dentro de cada prenda. Ahí no se veía
 * cuántas había marcadas ni cuántas caben, así que se acumulaban marcas que
 * no se mostraban en ningún lado. Acá se ve la selección completa y el tope.
 *
 * Solo lista prendas publicadas: una sin publicar no sale en la portada, así
 * que ofrecerla para estos espacios sería ofrecer algo que no va a pasar.
 */
export function SelectorPrendas({
  titulo,
  explicacion,
  productos,
  seleccionInicial,
  maximo,
  permiteVacio,
  onGuardar,
  onCerrar,
}: {
  titulo: string;
  explicacion: string;
  productos: ProductoAdmin[];
  seleccionInicial: string[];
  /** 1 para las bandas; 8 para "Los más pedidos". */
  maximo: number;
  permiteVacio: boolean;
  onGuardar: (ids: string[]) => Promise<void>;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [guardando, iniciarGuardado] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [elegidas, setElegidas] = useState<string[]>(seleccionInicial);

  const publicadas = useMemo(
    () => productos.filter((p) => p.visible_en_tienda && p.imagen_url),
    [productos]
  );

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return publicadas;
    return publicadas.filter(
      (p) =>
        normalizar(p.nombre).includes(q) ||
        normalizar(p.codigo_lote).includes(q) ||
        normalizar(p.categoria).includes(q)
    );
  }, [publicadas, busqueda]);

  const unaSola = maximo === 1;
  const lleno = elegidas.length >= maximo;

  function alternar(id: string) {
    setElegidas((previas) => {
      if (previas.includes(id)) return previas.filter((x) => x !== id);
      // Con una sola plaza, elegir otra reemplaza a la anterior.
      if (unaSola) return [id];
      if (previas.length >= maximo) return previas;
      return [...previas, id];
    });
  }

  function guardar() {
    iniciarGuardado(async () => {
      await onGuardar(elegidas);
      router.refresh();
      onCerrar();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-carbon/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-selector"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="mx-auto my-4 max-w-2xl rounded-tarjeta bg-white p-6 sombra-tarjeta">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="titulo-selector"
              className="text-xl font-extrabold text-carbon"
            >
              {titulo}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-carbon-suave">
              {explicacion}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md p-1 text-carbon-suave transition hover:text-carbon"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-4 text-sm font-semibold text-terracota-oscuro">
          {unaSola
            ? elegidas.length === 1
              ? "1 prenda elegida"
              : "Ninguna prenda elegida"
            : `${elegidas.length} de ${maximo} elegidas`}
          {!unaSola && lleno && (
            <span className="ml-1 font-normal text-carbon-suave">
              · quita una para poder añadir otra
            </span>
          )}
        </p>

        <div className="relative mt-3">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-carbon-suave"
            aria-hidden
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar prenda..."
            aria-label="Buscar prendas"
            className="w-full rounded-lg border border-linea py-2.5 pl-10 pr-3 text-sm text-carbon outline-none focus:border-terracota"
          />
        </div>

        {visibles.length === 0 ? (
          <p className="mt-5 rounded-lg bg-crema p-6 text-center text-sm text-carbon-suave">
            {publicadas.length === 0
              ? "No hay prendas publicadas con foto. Publica una prenda y vuelve."
              : "Ninguna prenda coincide con lo que buscas."}
          </p>
        ) : (
          <ul className="mt-4 grid max-h-[45vh] grid-cols-3 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-4">
            {visibles.map((p) => {
              const activa = elegidas.includes(p.id);
              const bloqueada = !activa && lleno && !unaSola;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => alternar(p.id)}
                    disabled={bloqueada}
                    aria-pressed={activa}
                    className={`group relative block w-full overflow-hidden rounded-lg border-2 text-left transition ${
                      activa
                        ? "border-terracota"
                        : "border-transparent hover:border-linea"
                    } ${bloqueada ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <div className="relative aspect-[3/4] bg-rosa-suave/30">
                      {p.imagen_url && (
                        <Image
                          src={p.imagen_url}
                          alt=""
                          fill
                          sizes="140px"
                          className="object-cover"
                        />
                      )}
                      {activa && (
                        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-terracota text-white">
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                    <p className="truncate px-1.5 pt-1.5 text-[11px] font-semibold text-carbon">
                      {p.nombre}
                    </p>
                    <p className="truncate px-1.5 pb-1.5 text-[10px] text-carbon-suave">
                      {formatSoles(p.precio_venta)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex gap-2.5">
          {permiteVacio && elegidas.length > 0 && (
            <button
              type="button"
              onClick={() => setElegidas([])}
              className="rounded-lg border border-linea px-4 py-3 text-sm font-semibold text-carbon-suave transition hover:text-carbon"
            >
              Dejar vacío
            </button>
          )}
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-terracota py-3 text-sm font-bold text-white transition hover:bg-terracota-oscuro disabled:opacity-50"
          >
            {guardando && <Loader2 size={16} className="animate-spin" />}
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
