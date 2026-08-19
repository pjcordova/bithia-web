export type MetodoPagoId = "yape" | "plin" | "bcp" | "bbva";

export type MetodoPago = {
  id: MetodoPagoId;
  etiqueta: string;
  /** "billetera" muestra número de celular; "banco" muestra CCI. */
  tipo: "billetera" | "banco";
  /** Número de celular (Yape/Plin) o CCI de 20 dígitos (transferencia). */
  dato: string;
  titular: string;
  /**
   * Intento de deep link al app correspondiente. Son esquemas no oficiales
   * (los bancos peruanos no publican una API de deep-linking para terceros),
   * así que pueden no abrir nada en algunos celulares — por eso siempre hay
   * un respaldo visible con el número/CCI para copiar a mano.
   */
  deepLink: string;
};

// TODO: datos de PRUEBA para armar el flujo. Antes de publicar, reemplazar
// por el número real de Yape/Plin de Bithia Brand y el CCI real de cada
// banco (pedírselo a la dueña).
export const METODOS_PAGO: Record<MetodoPagoId, MetodoPago> = {
  yape: {
    id: "yape",
    etiqueta: "Yape",
    tipo: "billetera",
    dato: "934023810",
    titular: "Alexander Loo",
    deepLink: "yape://",
  },
  plin: {
    id: "plin",
    etiqueta: "Plin",
    tipo: "billetera",
    // Plin de la cuenta Interbank de la dueña: se paga igual con el número
    // de celular, pero el intento de deep link abre la app de Interbank.
    dato: "934023810",
    titular: "Alexander Loo",
    deepLink: "interbank://",
  },
  bcp: {
    id: "bcp",
    etiqueta: "Transferencia BCP",
    tipo: "banco",
    dato: "00212311456789012345",
    titular: "Alexander Loo",
    deepLink: "bcpmovil://",
  },
  bbva: {
    id: "bbva",
    etiqueta: "Transferencia BBVA",
    tipo: "banco",
    dato: "01133451234567890123",
    titular: "Alexander Loo",
    deepLink: "bbvanetcashperu://",
  },
};

export const ORDEN_METODOS: MetodoPagoId[] = ["yape", "plin", "bcp", "bbva"];
