import Image from "next/image";
import { Pencil } from "lucide-react";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import { formatSoles } from "@/lib/format";

/**
 * Calco de <ProductCard> (la tarjeta que ve la clienta) pero como botón que
 * abre el formulario de edición en vez de un Link al detalle. Mismas clases,
 * mismas proporciones: si una prenda se ve distinta acá que en la web pública,
 * algo está mal configurado y hay que poder notarlo a simple vista.
 */
export function AdminProductCard({
  producto,
  onEditar,
}: {
  producto: ProductoAdmin;
  onEditar: (producto: ProductoAdmin) => void;
}) {
  const agotado = !producto.disponible;

  return (
    <button
      type="button"
      onClick={() => onEditar(producto)}
      aria-label={`Editar ${producto.nombre}, ${producto.codigo_lote}`}
      className="group block w-full overflow-hidden rounded-tarjeta bg-white text-left sombra-tarjeta transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] bg-rosa-suave/30">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition duration-300 group-hover:scale-[1.03] ${
              agotado ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-carbon-suave">
            Sin foto
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {agotado ? (
            <Etiqueta className="bg-carbon/80">Agotado</Etiqueta>
          ) : (
            producto.destacado && (
              <Etiqueta className="bg-white text-carbon">Más pedido</Etiqueta>
            )
          )}
          {!producto.visible_en_tienda && (
            <Etiqueta className="bg-linea text-carbon-suave">Oculto</Etiqueta>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-carbon/0 opacity-0 transition group-hover:bg-carbon/30 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-carbon shadow">
            <Pencil size={13} />
            Editar
          </span>
        </div>
      </div>

      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium text-carbon">
          {producto.nombre}
        </p>
        <p className="mt-0.5 text-[11px] text-carbon-suave">
          {producto.categoria} · {producto.codigo_lote}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-terracota-oscuro">
            {formatSoles(producto.precio_venta)}
          </p>
          {producto.tallas.length > 0 && (
            <p className="text-[11px] uppercase tracking-wide text-carbon-suave">
              {producto.tallas.join(" · ")}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function Etiqueta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white ${className}`}
    >
      {children}
    </span>
  );
}
