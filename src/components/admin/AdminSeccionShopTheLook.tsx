import Image from "next/image";
import { Pencil } from "lucide-react";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { SeccionVacia } from "@/components/admin/AdminSeccionDestacados";

export type AdminLookItem = {
  producto: ProductoAdmin;
  posX: number | null;
  posY: number | null;
};

export type AdminLook = {
  id: string;
  titulo: string;
  etiqueta: string | null;
  imagen_url: string;
  items: AdminLookItem[];
};

/**
 * Versión admin de <SeccionShopTheLook>. La foto grande y los textos se editan
 * con el botón de la esquina; cada prenda de la lista es editable como en el
 * resto de secciones. Mover los puntos sobre la foto sigue siendo una función
 * aparte. Mismo layout de dos columnas que la portada.
 */
export function AdminSeccionShopTheLook({
  look,
  onEditar,
  onEditarLook,
}: {
  look: AdminLook | null;
  onEditar: (producto: ProductoAdmin) => void;
  onEditarLook: (look: AdminLook) => void;
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

            {/* Sobre la foto y no debajo: es la única forma de que se entienda
                que edita esta foto y no la sección entera. */}
            <button
              type="button"
              onClick={() => onEditarLook(look)}
              className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-carbon shadow-md transition hover:bg-white"
            >
              <Pencil size={14} aria-hidden />
              Editar foto
            </button>
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
