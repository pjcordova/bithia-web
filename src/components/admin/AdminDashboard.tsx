"use client";

import Image from "next/image";
import { useState } from "react";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { ProductForm, type ProductoAdmin } from "@/components/admin/ProductForm";
import { cerrarSesion } from "@/app/admin/login/actions";
import { eliminarProducto } from "@/app/admin/actions";
import { formatSoles } from "@/lib/format";

export function AdminDashboard({ productos }: { productos: ProductoAdmin[] }) {
  // null = formulario cerrado; undefined = abierto en modo "agregar".
  const [editando, setEditando] = useState<ProductoAdmin | undefined | null>(
    null
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-linea bg-crema/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <h1 className="text-lg font-extrabold text-terracota-oscuro">
            Mi Catálogo
          </h1>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="rounded-lg p-2 text-terracota-oscuro transition hover:bg-rosa-suave/50"
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-carbon">Inventario</h2>
          <button
            type="button"
            onClick={() => setEditando(undefined)}
            className="inline-flex items-center gap-1.5 rounded-full bg-terracota px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-terracota-oscuro"
          >
            <Plus size={16} aria-hidden />
            Agregar
          </button>
        </div>

        {productos.length === 0 ? (
          <p className="mt-8 rounded-tarjeta bg-white p-8 text-center text-sm text-carbon-suave sombra-tarjeta">
            Todavía no has agregado prendas. Toca “Agregar” para publicar la
            primera.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {productos.map((p) => (
              <li
                key={p.id}
                className="rounded-tarjeta bg-white p-3 sombra-tarjeta"
              >
                <div className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-rosa-suave/30">
                    {p.imagen_url && (
                      <Image
                        src={p.imagen_url}
                        alt={p.nombre}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-carbon">
                          {p.nombre}
                        </p>
                        <p className="text-xs text-rosa">{p.categoria}</p>
                        <p className="mt-0.5 text-[11px] text-carbon-suave">
                          {p.codigo_lote}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setEditando(p)}
                          className="rounded-md p-1.5 text-carbon-suave transition hover:bg-rosa-suave/40 hover:text-terracota"
                          aria-label={`Editar ${p.nombre}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <form
                          action={eliminarProducto}
                          onSubmit={(e) => {
                            if (
                              !confirm(
                                `¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="rounded-md p-1.5 text-carbon-suave transition hover:bg-rosa-suave/40 hover:text-rosa"
                            aria-label={`Eliminar ${p.nombre}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </div>

                    <p className="mt-1 text-sm font-extrabold text-terracota-oscuro">
                      {formatSoles(p.precio_venta)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-linea pt-2.5">
                  <p className="text-xs text-carbon-suave">
                    Tallas:{" "}
                    <span className="font-semibold text-carbon">
                      {p.tallas.length > 0 ? p.tallas.join(" · ") : "—"}
                    </span>
                  </p>
                  <div className="flex gap-1.5">
                    {!p.visible_en_tienda && (
                      <span className="rounded-md bg-linea px-2 py-1 text-[10px] font-bold uppercase text-carbon-suave">
                        Oculto
                      </span>
                    )}
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${
                        p.disponible
                          ? "bg-rosa-suave/60 text-terracota-oscuro"
                          : "bg-carbon/10 text-carbon"
                      }`}
                    >
                      {p.disponible ? "Activo" : "Agotado"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {editando !== null && (
        <ProductForm
          producto={editando}
          onCerrar={() => setEditando(null)}
        />
      )}
    </div>
  );
}
