"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BadgeCheck, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import type { ProductoPublico } from "@/lib/productos";
import { useCart } from "@/lib/cart-store";
import { esNueva, formatSoles } from "@/lib/format";
import { TALLAS } from "@/lib/categorias";
import { SIN_STOCK, useStockEnVivo } from "@/lib/useStockEnVivo";

export function ProductoDetalle({ producto }: { producto: ProductoPublico }) {
  const { agregar } = useCart();
  // Una sola prenda, una sola consulta: acá la clienta ya está eligiendo
  // talla, así que vale preguntarle al ERP (al abrir y al volver a la
  // pestaña, no en bucle).
  const { ok, porCodigo } = useStockEnVivo([producto.codigo_lote]);
  const porTalla = porCodigo.get(producto.codigo_lote) ?? SIN_STOCK;
  // Con ok=false (ERP caído, sin configurar, o no respondió a tiempo) se cae
  // al toggle manual de siempre. Con ok=true, manda el stock real — incluso
  // si el ERP no tiene este producto, eso significa agotado, no "no sabemos".
  const agotado = ok
    ? !producto.disponible || TALLAS.every((t) => (porTalla.get(t) || 0) <= 0)
    : !producto.disponible;

  const [talla, setTalla] = useState<string | null>(
    producto.tallas.length === 1 ? producto.tallas[0] : null
  );
  const [cantidad, setCantidad] = useState(1);
  // Confirmación en la misma página: ya no se redirige al carrito para que
  // la clienta pueda seguir agregando más prendas sin interrupciones.
  const [agregado, setAgregado] = useState(false);

  // Con stock real disponible, no se puede pedir más de lo que hay. Sin él
  // (ok=false), sin tope — comportamiento de siempre.
  const maxCantidad = ok && talla ? Math.max(1, porTalla.get(talla) || 0) : Infinity;
  useEffect(() => {
    setCantidad((c) => Math.min(c, maxCantidad));
  }, [maxCantidad]);

  const puedeAgregar = !agotado && talla !== null;

  function onAgregar() {
    if (!puedeAgregar || !talla) return;
    agregar({
      productoId: producto.id,
      codigoLote: producto.codigo_lote,
      nombre: producto.nombre,
      talla,
      precio: producto.precio_venta,
      cantidad,
      imagenUrl: producto.imagen_url,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  }

  return (
    <div className="mt-4 grid gap-8 md:grid-cols-2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-tarjeta bg-rosa-suave/30">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className={`object-cover ${agotado ? "opacity-60 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-carbon-suave">
            Sin foto
          </div>
        )}
        {agotado ? (
          <span className="absolute left-3 top-3 rounded-md bg-carbon/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Agotado
          </span>
        ) : (
          esNueva(producto.created_at) && (
            <span className="absolute left-3 top-3 rounded-md bg-terracota px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Nuevo
            </span>
          )
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-rosa">
          {producto.categoria}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-carbon md:text-3xl">
          {producto.nombre}
        </h1>
        <p className="mt-2 text-xl font-extrabold text-terracota-oscuro">
          {formatSoles(producto.precio_venta)}
        </p>
        <p className="mt-2 text-sm text-carbon-suave">
          Color: {producto.color_principal}
          <span className="mx-2 text-linea">|</span>
          Cód. {producto.codigo_lote}
        </p>

        <div className="mt-7">
          <h2 className="text-xs font-bold uppercase tracking-wide text-carbon">
            Talla
          </h2>
          <div className="mt-3 flex gap-3">
            {TALLAS.map((t) => {
              // Se muestran las tres tallas siempre; las que esta prenda no
              // maneja (o no tienen stock real en el ERP) quedan visibles
              // pero deshabilitadas.
              const existeEnCatalogo = producto.tallas.includes(t);
              const existe = ok
                ? existeEnCatalogo && (porTalla.get(t) || 0) > 0
                : existeEnCatalogo;
              const activa = talla === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!existe || agotado}
                  aria-pressed={activa}
                  onClick={() => setTalla(t)}
                  className={`h-11 w-11 rounded-full border text-sm font-semibold transition ${
                    activa
                      ? "border-terracota bg-terracota text-white"
                      : existe && !agotado
                        ? "border-linea bg-white text-carbon hover:border-terracota"
                        : "cursor-not-allowed border-linea bg-white text-linea"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {!agotado && talla === null && (
            <p className="mt-2 text-xs text-rosa">Elige una talla para continuar.</p>
          )}
          {!agotado && talla !== null && ok && (porTalla.get(talla) || 0) <= 2 && (
            <p className="mt-2 text-xs font-semibold text-rosa">
              ¡Últimas {porTalla.get(talla)} unidades en talla {talla}!
            </p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-carbon">
            Cantidad
          </h2>
          <div className="mt-3 inline-flex items-center gap-4 rounded-lg border border-linea bg-white px-3 py-2">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              disabled={cantidad <= 1}
              className="text-carbon-suave transition hover:text-terracota disabled:opacity-30"
              aria-label="Quitar una unidad"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center text-sm font-semibold" aria-live="polite">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.min(maxCantidad, c + 1))}
              disabled={cantidad >= maxCantidad}
              className="text-carbon-suave transition hover:text-terracota disabled:opacity-30"
              aria-label="Agregar una unidad"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onAgregar}
          disabled={!puedeAgregar}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-terracota py-3.5 text-sm font-semibold text-white transition hover:bg-terracota-oscuro disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={18} aria-hidden />
          {agotado ? "Agotado" : "Agregar al carrito"}
        </button>
        {agregado && (
          <p
            role="status"
            className="mt-2 text-center text-xs font-semibold text-terracota-oscuro"
          >
            Agregado al carrito ✓
          </p>
        )}

        {producto.descripcion && (
          <p className="mt-6 text-sm leading-relaxed text-carbon-suave">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <p className="flex gap-3 rounded-tarjeta bg-rosa-suave/30 p-4 text-xs leading-relaxed text-carbon-suave">
            <Truck size={18} className="shrink-0 text-terracota" aria-hidden />
            Recojo en tienda (Polvos Azules, Stand 170, Ica) o delivery coordinado
            de forma personalizada por WhatsApp.
          </p>
          <p className="flex gap-3 rounded-tarjeta bg-rosa-suave/30 p-4 text-xs leading-relaxed text-carbon-suave">
            <BadgeCheck size={18} className="shrink-0 text-terracota" aria-hidden />
            Calidad boutique garantizada. Diseños exclusivos y unidades
            limitadas.
          </p>
        </div>
      </div>
    </div>
  );
}
