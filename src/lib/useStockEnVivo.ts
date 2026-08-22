"use client";

import { useEffect, useState } from "react";

export type StockEnVivo = {
  cargando: boolean;
  /**
   * true solo si el ERP respondió con éxito (aunque sea "este código no
   * existe ahí" — un array vacío es una respuesta válida). false significa
   * que no se pudo consultar (ERP caído, sin configurar, timeout): ahí hay
   * que caer al toggle manual disponible/agotado, como si esto no existiera.
   *
   * Con ok=true, el ERP manda: un código sin filas es agotado de verdad, no
   * "no sabemos" — nunca se usa el toggle manual como respaldo en ese caso.
   */
  ok: boolean;
  porTalla: Map<string, number>;
};

/** Stock real de un producto, consultado al ERP vía /api/stock. */
export function useStockEnVivo(codigoLote: string): StockEnVivo {
  const [estado, setEstado] = useState<StockEnVivo>({
    cargando: true,
    ok: false,
    porTalla: new Map(),
  });

  useEffect(() => {
    let cancelado = false;
    fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigos: [codigoLote] }),
    })
      .then((r) => (r.ok ? r.json() : { ok: false, stock: {} }))
      .then(
        (data: {
          ok: boolean;
          stock: Record<string, { talla: string; cantidad: number }[]>;
        }) => {
          if (cancelado) return;
          const filas = data.stock?.[codigoLote] || [];
          setEstado({
            cargando: false,
            ok: !!data.ok,
            porTalla: new Map(filas.map((f) => [f.talla, f.cantidad])),
          });
        }
      )
      .catch(() => {
        if (!cancelado) setEstado({ cargando: false, ok: false, porTalla: new Map() });
      });
    return () => {
      cancelado = true;
    };
  }, [codigoLote]);

  return estado;
}
