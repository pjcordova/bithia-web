import type { CartItem } from "@/lib/cart-store";
import { formatSoles } from "@/lib/format";
import type { MetodoPago } from "@/lib/pagos";

/**
 * Arma el mensaje de pedido. Cada línea lleva el código de lote porque el
 * personal lo usa para verificar el stock real en el ERP antes de confirmar
 * la venta — el sitio no valida stock a propósito.
 *
 * `metodo` y `comprobanteUrl` son opcionales porque el link de WhatsApp del
 * footer/contacto reusa esta misma función sin pasar por el pago.
 */
export function construirMensajePedido(
  items: CartItem[],
  opciones?: { metodo?: MetodoPago; comprobanteUrl?: string }
): string {
  const lineas = items.map((item) => {
    const subtotal = item.precio * item.cantidad;
    return `🛍️ ${item.codigoLote} — ${item.nombre} (Talla ${item.talla}) x${item.cantidad} — ${formatSoles(subtotal)}`;
  });

  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);

  const bloquePago = opciones?.metodo
    ? [
        "",
        `💳 Pagué por: ${opciones.metodo.etiqueta}`,
        ...(opciones.comprobanteUrl
          ? [`🧾 Comprobante: ${opciones.comprobanteUrl}`]
          : []),
      ]
    : [];

  return [
    "¡Hola Bithia Brand! 👋 Quiero hacer este pedido desde la web:",
    "",
    ...lineas,
    "",
    `💰 Total: ${formatSoles(total)}`,
    "📍 Entrega: Por coordinar",
    ...bloquePago,
    "",
    "Mi nombre:",
  ].join("\n");
}

/**
 * Un número vacío produce `wa.me/?text=...`, que abre WhatsApp sin
 * destinatario: la clienta cree que envió el pedido y no llega a nadie.
 * Antes de mostrar el botón hay que comprobar que esté configurado.
 */
export function numeroWhatsApp(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}

export function hayNumeroWhatsApp(): boolean {
  // Un número peruano con código de país tiene 11 dígitos (51 + 9 del móvil).
  return numeroWhatsApp().length >= 8;
}

export function construirLinkWhatsApp(
  items: CartItem[],
  opciones?: { metodo?: MetodoPago; comprobanteUrl?: string }
): string {
  const texto = encodeURIComponent(construirMensajePedido(items, opciones));
  return `https://wa.me/${numeroWhatsApp()}?text=${texto}`;
}

/** Link simple, sin pedido, para los enlaces de contacto del footer. */
export function linkWhatsAppContacto(mensaje?: string): string {
  const base = `https://wa.me/${numeroWhatsApp()}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
