"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatSoles } from "@/lib/format";
import { hayNumeroWhatsApp } from "@/lib/whatsapp";
import { MetodoPagoSelector } from "@/components/MetodoPagoSelector";

export function CarritoVista() {
  const { items, total, listo, cambiarCantidad, quitar, vaciar } = useCart();
  // Se activa al enviar el pedido por WhatsApp: vacía el carrito para que no
  // quede el mismo pedido esperando en el celular después de coordinarlo, y
  // muestra el mensaje de confirmación aunque la lista ya esté vacía.
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

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

        {pedidoEnviado && (
          <ModalGracias onCerrar={() => setPedidoEnviado(false)} />
        )}
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
      {hayNumeroWhatsApp() && (
        <>
          <MetodoPagoSelector
            items={items}
            onPedidoEnviado={() => {
              vaciar();
              setPedidoEnviado(true);
            }}
          />
          <p className="mt-3 text-center text-xs text-carbon-suave">
            Elige tu método de pago, adjunta la captura y coordinamos la
            entrega por WhatsApp.
          </p>
        </>
      )}
    </div>
  );
}

function ModalGracias({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-carbon/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-gracias"
      onClick={onCerrar}
    >
      <div
        className="w-full rounded-t-2xl bg-white p-8 text-center sm:max-w-sm sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckCircle2 className="mx-auto text-whatsapp" size={48} />
        <h2
          id="titulo-modal-gracias"
          className="mt-4 text-xl font-extrabold text-terracota-oscuro"
        >
          ¡Gracias por tu compra!
        </h2>
        <p className="mt-2 text-sm text-carbon-suave">
          Tu pedido estará listo pronto. Te confirmamos por WhatsApp los
          detalles de pago y entrega.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 block w-full rounded-lg bg-terracota-oscuro py-3 text-sm font-bold text-white transition hover:bg-carbon"
        >
          Seguir viendo el catálogo
        </Link>
      </div>
    </div>
  );
}
