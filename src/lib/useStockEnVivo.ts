"use client";

import { useCallback, useEffect, useState } from "react";

/** Cantidades por talla de un código de lote: "M" → 3. */
export type StockPorTalla = Map<string, number>;

/** Se comparte para no crear un Map vacío nuevo en cada render. */
export const SIN_STOCK: StockPorTalla = new Map();

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
  /** codigo_lote → (talla → cantidad). Vacío mientras ok sea false. */
  porCodigo: Map<string, StockPorTalla>;
  /** Vuelve a preguntarle al ERP ahora mismo, sin esperar nada. */
  revalidar: () => void;
};

/**
 * Stock real consultado al ERP vía /api/stock, para varios códigos de lote en
 * una sola petición.
 *
 * Se consulta al montar, al volver a la pestaña, y cuando el llamador pide
 * `revalidar()` — no en un bucle por segundo. Cada consulta acá se traduce en
 * una llamada saliente al ERP en Railway, así que se piden solo los códigos
 * que la clienta ya eligió (ficha de producto y carrito), nunca el catálogo
 * entero: una grilla de 30 prendas sondeando sola saturaría el ERP sin que
 * nadie esté por comprar.
 *
 * `intervaloMs` existe para casos que de verdad necesiten sondeo periódico;
 * por defecto está apagado a propósito.
 */
export function useStockEnVivo(
  codigos: string[],
  opciones: { intervaloMs?: number } = {}
): StockEnVivo {
  const { intervaloMs } = opciones;
  const [estado, setEstado] = useState<Omit<StockEnVivo, "revalidar">>({
    cargando: true,
    ok: false,
    porCodigo: new Map(),
  });
  // Cambiarlo fuerza una consulta nueva; es lo que dispara revalidar().
  const [pulso, setPulso] = useState(0);
  const revalidar = useCallback(() => setPulso((p) => p + 1), []);

  // El array llega nuevo en cada render del padre: se compara por contenido
  // para no reconsultar de más. Los códigos de lote nunca llevan coma
  // (formato VES-2508-01, o VES-2508-01-ROJO), así que unir y separar es seguro.
  const clave = codigos.join(",");

  useEffect(() => {
    const lista = clave ? clave.split(",") : [];
    if (lista.length === 0) {
      setEstado({ cargando: false, ok: false, porCodigo: new Map() });
      return;
    }

    let cancelado = false;
    let enCurso = false;
    // Un solo tropiezo de red no debe apagar el stock real y caer al toggle
    // manual — recién después de unos fallos seguidos se asume que el ERP
    // realmente no está respondiendo.
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
          body: JSON.stringify({ codigos: lista }),
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
        const porCodigo = new Map<string, StockPorTalla>();
        for (const codigo of lista) {
          const filas = data.stock?.[codigo] ?? [];
          porCodigo.set(codigo, new Map(filas.map((f) => [f.talla, f.cantidad])));
        }
        setEstado({ cargando: false, ok: true, porCodigo });
      } catch {
        if (cancelado) return;
        fallosSeguidos += 1;
        if (fallosSeguidos >= FALLOS_PARA_CAER) {
          setEstado({ cargando: false, ok: false, porCodigo: new Map() });
        } else {
          setEstado((e) => ({ ...e, cargando: false }));
        }
      } finally {
        enCurso = false;
      }
    }

    consultar();

    // Volver a la pestaña después de un rato es justo cuando el dato puede
    // haber quedado viejo; cuesta una petición, no una por segundo.
    function siEstaVisible() {
      if (document.visibilityState === "visible") consultar();
    }
    document.addEventListener("visibilitychange", siEstaVisible);
    const intervalo = intervaloMs ? setInterval(siEstaVisible, intervaloMs) : undefined;

    return () => {
      cancelado = true;
      document.removeEventListener("visibilitychange", siEstaVisible);
      if (intervalo) clearInterval(intervalo);
    };
  }, [clave, intervaloMs, pulso]);

  return { ...estado, revalidar };
}
