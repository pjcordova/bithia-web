"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatSoles } from "@/lib/format";
import { construirLinkWhatsApp, hayNumeroWhatsApp } from "@/lib/whatsapp";

export function CarritoVista() {
  const { items, total, listo, cambiarCantidad, quitar } = useCart();

  // Hasta leer localStorage no sabemos si el carrito tiene algo; mostrar
  // "vacío" antes de tiempo haría parpadear la pantalla.
  if (!listo) {
    return <div className="py-20" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-extrabold text-terracota-oscuro">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-sm text-carbon-suave">
          Agrega prendas desde el catálogo para armar tu pedido.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-lg bg-terracota px-6 py-3 text-sm font-semibold text-white transition hover:bg-terracota-oscuro"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-extrabold text-terracota-oscuro">
        Tu Carrito
      </h1>
      <p className="mt-1 text-sm text-rosa">
        Revisa tus productos antes de confirmar por WhatsApp.
      </p>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={`${item.productoId}-${item.talla}`}
            className="flex gap-4 rounded-tarjeta bg-white p-3 sombra-tarjeta"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-rosa-suave/30">
              {item.imagenUrl && (
                <Image
                  src={item.imagenUrl}
                  alt={item.nombre}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="truncate text-sm font-semibold text-carbon">
                  {item.nombre}
                </p>
                <p className="mt-0.5 text-xs text-carbon-suave">
                  Talla: {item.talla}
                </p>
                <p className="mt-1 text-sm font-extrabold text-terracota-oscuro">
                  {formatSoles(item.precio * item.cantidad)}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => cambiarCantidad(item.productoId, item.talla, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-linea text-carbon-suave transition hover:border-terracota hover:text-terracota"
                  aria-label={`Quitar una unidad de ${item.nombre} talla ${item.talla}`}
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-terracota-oscuro">
                  {item.cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(item.productoId, item.talla, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-linea text-carbon-suave transition hover:border-terracota hover:text-terracota"
                  aria-label={`Agregar una unidad de ${item.nombre} talla ${item.talla}`}
                >
                  <Plus size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => quitar(item.productoId, item.talla)}
                  className="ml-auto text-carbon-suave transition hover:text-rosa"
                  aria-label={`Quitar ${item.nombre} talla ${item.talla} del carrito`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-tarjeta bg-white p-5 sombra-tarjeta">
        <div className="flex justify-between text-sm text-carbon-suave">
          <span>Subtotal</span>
          <span className="font-semibold text-carbon">{formatSoles(total)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-carbon-suave">
          <span>Envío</span>
          <span className="italic">Por coordinar</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-linea pt-4">
          <span className="font-extrabold text-carbon">Total</span>
          <span className="text-lg font-extrabold text-terracota-oscuro">
            {formatSoles(total)}
          </span>
        </div>
      </div>

      {/* Sin número configurado el enlace abriría WhatsApp sin destinatario:
          mejor bloquear el botón que perder el pedido en silencio. */}
      {!hayNumeroWhatsApp() && (
        <p
          role="alert"
          className="mt-5 rounded-tarjeta bg-rosa-suave/50 p-4 text-center text-sm text-terracota-oscuro"
        >
          El pedido por WhatsApp no está disponible en este momento. Escríbenos
          por Instagram o acércate a la tienda y con gusto te atendemos.
        </p>
      )}

      {/* El pedido no se guarda en base de datos: WhatsApp es el registro. */}
      <a
        href={construirLinkWhatsApp(items)}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!hayNumeroWhatsApp()}
        onClick={(e) => {
          if (!hayNumeroWhatsApp()) e.preventDefault();
        }}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp py-4 text-sm font-bold text-white transition ${
          hayNumeroWhatsApp()
            ? "hover:brightness-95"
            : "pointer-events-none opacity-40"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4z" />
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
        </svg>
        Confirmar pedido por WhatsApp
      </a>
      <p className="mt-3 text-center text-xs text-carbon-suave">
        Coordinamos contigo el pago y la entrega por WhatsApp.
      </p>
    </div>
  );
}
