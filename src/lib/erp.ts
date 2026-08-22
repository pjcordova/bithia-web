import type { MetodoPagoId } from "@/lib/pagos";

export type LineaDescuento = {
  codigo_lote: string;
  talla: string;
  cantidad: number;
};

export type ResultadoDescuentoErp =
  | { ok: true }
  | { ok: false; motivo: string };

// El ERP registra el método de pago con su propio vocabulario (comparte
// columna con las ventas de mostrador: efectivo/yape/plin/transferencia/
// tarjeta). BCP y BBVA son ambos "transferencia" para el ERP — la
// diferencia de banco no le importa a esa columna.
const METODO_PAGO_ERP: Record<MetodoPagoId, string> = {
  yape: "yape",
  plin: "plin",
  bcp: "transferencia",
  bbva: "transferencia",
};

/**
 * Avisa al ERP que se confirmó un pedido para que descuente ahí el stock
 * real — bithia-web nunca guarda cantidades propias, a propósito (ver
 * README). Es el otro sistema, el que sabe descontar sin duplicar el dato.
 *
 * Nunca debe bloquear ni tumbar el flujo de WhatsApp: si el ERP no responde,
 * no está configurado, o tarda demasiado, se devuelve el motivo para
 * registrarlo en el log, pero el pedido ya se mandó igual. Ver
 * docs/integracion-erp-stock.md para el contrato completo del endpoint.
 */
export async function notificarDescuentoStock(
  lineas: LineaDescuento[],
  metodoPago: MetodoPagoId
): Promise<ResultadoDescuentoErp> {
  const url = process.env.ERP_STOCK_WEBHOOK_URL;
  const apiKey = process.env.ERP_STOCK_API_KEY;

  if (!url || !apiKey) {
    return {
      ok: false,
      motivo: "ERP no configurado (faltan ERP_STOCK_WEBHOOK_URL / ERP_STOCK_API_KEY).",
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        items: lineas,
        metodo_pago: METODO_PAGO_ERP[metodoPago],
      }),
      // El pedido ya se envió por WhatsApp; no tiene sentido que este
      // aviso, que es un extra, deje a la clienta esperando.
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { ok: false, motivo: `El ERP respondió con estado ${res.status}.` };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      motivo: e instanceof Error ? e.message : "Error desconocido al contactar el ERP.",
    };
  }
}

export type StockPorTalla = { talla: string; cantidad: number };

/**
 * Stock real por código de lote, consultado en vivo al ERP — para que el
 * catálogo muestre las mismas cantidades que ve la dueña en su panel, en
 * vez de solo el toggle manual disponible/agotado.
 *
 * Solo lectura, server-side (nunca se llama desde el navegador de la
 * clienta: la API key del ERP no puede viajar ahí). Si el ERP no está
 * configurado, no responde a tiempo, o falla, se devuelve un mapa vacío —
 * el catálogo cae de vuelta al toggle manual, nunca se rompe por esto.
 */
export async function consultarStockErp(
  codigosLote: string[]
): Promise<Record<string, StockPorTalla[]>> {
  const url = process.env.ERP_STOCK_QUERY_URL;
  const apiKey = process.env.ERP_STOCK_API_KEY;

  if (!url || !apiKey || codigosLote.length === 0) return {};

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ codigos: codigosLote }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.error("[erp] no se pudo consultar stock:", e);
    return {};
  }
}
