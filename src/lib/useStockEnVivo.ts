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

const INTERVALO_MS = 1000;

/**
 * Stock real de un producto, consultado al ERP vía /api/stock — y vuelto a
 * consultar cada segundo mientras la pestaña esté a la vista. Así, si el
 * stock cambia del lado del ERP (una venta en el POS de la tienda física,
 * o de otra clienta comprando por WhatsApp), quien esté mirando esta
 * página lo ve reflejado casi al instante, sin tener que recargar.
 */
export function useStockEnVivo(codigoLote: string): StockEnVivo {
  const [estado, setEstado] = useState<StockEnVivo>({
    cargando: true,
    ok: false,
    porTalla: new Map(),
  });

  useEffect(() => {
    let cancelado = false;
    let enCurso = false;
    // Un solo tropiezo de red (un poll perdido) no debe apagar el stock en
    // vivo y caer al toggle manual — recién después de unos fallos
    // seguidos se asume que el ERP realmente no está respondiendo.
    let fallosSeguidos = 0;
    const FALLOS_PARA_CAER = 3;

    async function consultar() {
      // Evita apilar consultas si una respuesta tarda más que el intervalo.
      if (enCurso) return;
      enCurso = true;
      try {
        const res = await fetch("/api/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigos: [codigoLote] }),
          cache: "no-store",
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: {
          ok: boolean;
          stock: Record<string, { talla: string; cantidad: number }[]>;
        } = await res.json();
        if (cancelado) return;
        if (!data.ok) throw new Error("ERP no disponible");
        fallosSeguidos = 0;
        const filas = data.stock?.[codigoLote] || [];
        setEstado({
          cargando: false,
          ok: true,
          porTalla: new Map(filas.map((f) => [f.talla, f.cantidad])),
        });
      } catch {
        if (cancelado) return;
        fallosSeguidos += 1;
        if (fallosSeguidos >= FALLOS_PARA_CAER) {
          setEstado({ cargando: false, ok: false, porTalla: new Map() });
        } else {
          setEstado((e) => ({ ...e, cargando: false }));
        }
      } finally {
        enCurso = false;
      }
    }

    consultar();
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") consultar();
    }, INTERVALO_MS);

    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [codigoLote]);

  return estado;
}
