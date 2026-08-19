import Image from "next/image";
import { Pencil } from "lucide-react";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import { formatSoles } from "@/lib/format";
import { SeccionVacia } from "@/components/admin/AdminSeccionDestacados";

/**
 * Versión admin de <SeccionTopSemana>. Se deja de lado la galería deslizable
 * y los controles de compra (talla, medidas, agregar al carrito): en el panel
 * no tienen sentido y complicarían el clic de edición sin aportar nada. Se
 * conserva el mismo encabezado y la misma foto grande para que la sección se
 * reconozca de inmediato al compararla con la portada.
 */
export function AdminSeccionTopSemana({
  producto,
  onEditar,
}: {
  producto: ProductoAdmin | null;
  onEditar: (producto: ProductoAdmin) => void;
}) {
  if (!producto) {
    return (
      <SeccionVacia titulo="Top de la semana">
        Ninguna prenda visible está marcada como “Top de la semana” todavía.
        Actívala desde su formulario de edición (necesita foto de portada).
      </SeccionVacia>
    );
  }

  return (
    <section className="mt-16" aria-labelledby="admin-top-semana">
      <p className="text-center text-[11px] uppercase tracking-[0.18em] text-carbon-suave">
        <span className="font-bold text-carbon">Diseño top</span> de esta semana
      </p>
      <h2
        id="admin-top-semana"
        className="mt-3 text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl"
      >
        Top de la semana
      </h2>

      <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:gap-14">
        <button
          type="button"
          onClick={() => onEditar(producto)}
          aria-label={`Editar ${producto.nombre}`}
          className="group relative aspect-[3/4] overflow-hidden rounded-tarjeta bg-rosa-suave/25 md:min-h-[520px]"
        >
          {producto.imagen_url && (
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className={`object-cover ${!producto.disponible ? "opacity-50 grayscale" : ""}`}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-carbon/0 opacity-0 transition group-hover:bg-carbon/30 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-carbon shadow">
              <Pencil size={13} />
              Editar
            </span>
          </div>
        </button>

        <div className="md:pt-4">
          <h3 className="text-lg font-medium uppercase tracking-[0.1em] text-carbon md:text-xl">
            {producto.nombre}
          </h3>
          <p className="mt-3 text-lg tracking-[0.05em] text-carbon-suave">
            {formatSoles(producto.precio_venta)}
          </p>
          <p className="mt-1 text-sm text-carbon-suave">
            {producto.categoria} · {producto.codigo_lote}
          </p>

          <button
            type="button"
            onClick={() => onEditar(producto)}
            className="mt-8 inline-flex items-center gap-2 bg-carbon px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-carbon/85"
          >
            <Pencil size={14} />
            Editar esta prenda
          </button>
        </div>
      </div>
    </section>
  );
}
