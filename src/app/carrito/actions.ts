"use server";

import { notificarDescuentoStock, type LineaDescuento } from "@/lib/erp";

/**
 * Se llama justo cuando la clienta envía el pedido por WhatsApp (ver
 * MetodoPagoSelector). No es parte del flujo crítico: si falla, el pedido ya
 * salió igual, así que acá solo se registra el motivo para que alguien lo
 * revise, nunca se lanza un error hacia el cliente.
 */
export async function registrarDescuentoStock(
  lineas: LineaDescuento[]
): Promise<void> {
  const resultado = await notificarDescuentoStock(lineas);
  if (!resultado.ok) {
    console.error("[erp] no se pudo descontar stock automáticamente:", {
      motivo: resultado.motivo,
      lineas,
    });
  }
}
