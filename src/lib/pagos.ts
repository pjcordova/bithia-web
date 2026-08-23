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

/**
 * Yape y Plin ya tienen los datos reales de Geraldine Cerna, la dueña.
 *
 * ⚠️ PENDIENTE ANTES DE PUBLICAR: los CCI de BCP y BBVA de acá abajo siguen
 * siendo INVENTADOS, de cuando se armó el flujo. Si el sitio sale a producción
 * así, una clienta puede transferir a una cuenta que no existe o que no es de
 * Bithia. Pedirle los dos CCI reales a Geraldine y reemplazarlos, o quitar
 * esos dos métodos de ORDEN_METODOS hasta tenerlos.
 */
export const METODOS_PAGO: Record<MetodoPagoId, MetodoPago> = {
  yape: {
    id: "yape",
    etiqueta: "Yape",
    tipo: "billetera",
    dato: "942275208",
    titular: "Geraldine Cerna",
    deepLink: "yape://",
  },
  plin: {
    id: "plin",
    etiqueta: "Plin",
    tipo: "billetera",
    // Plin se paga con el mismo número de celular que Yape; el deep link
    // apunta a Interbank, que es donde vive el Plin de la dueña.
    dato: "942275208",
    titular: "Geraldine Cerna",
    deepLink: "interbank://",
  },
  bcp: {
    id: "bcp",
    etiqueta: "Transferencia BCP",
    tipo: "banco",
    // ⚠️ CCI INVENTADO — ver el aviso de arriba.
    dato: "00212311456789012345",
    titular: "Geraldine Cerna",
    deepLink: "bcpmovil://",
  },
  bbva: {
    id: "bbva",
    etiqueta: "Transferencia BBVA",
    tipo: "banco",
    // ⚠️ CCI INVENTADO — ver el aviso de arriba.
    dato: "01133451234567890123",
    titular: "Geraldine Cerna",
    deepLink: "bbvanetcashperu://",
  },
};

export const ORDEN_METODOS: MetodoPagoId[] = ["yape", "plin", "bcp", "bbva"];
