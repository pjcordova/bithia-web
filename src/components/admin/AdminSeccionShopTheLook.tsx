import Image from "next/image";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { SeccionVacia } from "@/components/admin/AdminSeccionDestacados";

export type AdminLookItem = {
  producto: ProductoAdmin;
  posX: number | null;
  posY: number | null;
};

export type AdminLook = {
  titulo: string;
  etiqueta: string | null;
  imagen_url: string;
  items: AdminLookItem[];
};

/**
 * Versión admin de <SeccionShopTheLook>. La foto y los puntos de ubicación
 * quedan solo de referencia (armar o mover un "look" es una función aparte,
 * todavía no construida); cada prenda de la lista sí es editable como en el
 * resto de secciones. Mismo layout de dos columnas que la portada.
 */
export function AdminSeccionShopTheLook({
  look,
  onEditar,
}: {
  look: AdminLook | null;
  onEditar: (producto: ProductoAdmin) => void;
}) {
  if (!look || look.items.length === 0) {
    return (
      <SeccionVacia titulo="Shop the look">
        No hay un “look” activo con prendas visibles. Este apartado se arma
        aparte (foto + prendas asociadas); no se administra desde acá todavía.
      </SeccionVacia>
    );
  }

  return (
    <section className="mt-16" aria-labelledby="admin-shop-the-look">
      <h2
        id="admin-shop-the-look"
        className="text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl"
      >
        {look.titulo}
      </h2>

      <div className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 md:grid-cols-[1.4fr_1fr] md:gap-12">
        <div className="relative flex md:h-full">
          {look.etiqueta && (
            <p
              aria-hidden
              className="hidden shrink-0 select-none overflow-hidden text-3xl font-extrabold uppercase leading-none tracking-tight text-carbon md:block lg:text-4xl xl:text-5xl"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {look.etiqueta}
            </p>
          )}
          <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-rosa-suave/20 md:aspect-auto md:h-full">
            <Image
              src={look.imagen_url}
              alt={look.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
            />
            {look.items.map((it, i) =>
              it.posX !== null && it.posY !== null ? (
                <span
                  key={it.producto.id}
                  className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 bg-white/70 shadow-md"
                  style={{ left: `${it.posX}%`, top: `${it.posY}%` }}
                  aria-hidden
                >
                  <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-carbon">
                    {i + 1}
                  </span>
                </span>
              ) : null
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:justify-center md:gap-3">
          {look.items.map((it) => (
            <AdminProductCard
              key={it.producto.id}
              producto={it.producto}
              onEditar={onEditar}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
