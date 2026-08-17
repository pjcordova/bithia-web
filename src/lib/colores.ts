/**
 * Traducción de nombre de color a hex, para pintar el punto de la tarjeta.
 *
 * Existe para que las prendas ya cargadas muestren su punto sin que la dueña
 * tenga que volver a editarlas una por una. Cuando ella elige un color a mano
 * en el panel, ese valor manda sobre este diccionario.
 */
const PALETA: Record<string, string> = {
  // Neutros
  blanco: "#FFFFFF",
  hueso: "#F2EDE4",
  crema: "#F5EFE0",
  beige: "#E8DCC8",
  arena: "#DDD0BA",
  nude: "#E3BC9A",
  camel: "#C19A6B",
  gris: "#9E9E9E",
  "gris claro": "#D3D3D3",
  plomo: "#7A7A7A",
  negro: "#1C1C1C",

  // Cálidos
  terracota: "#C1643C",
  terracotta: "#C1643C",
  ladrillo: "#A64B2A",
  cobre: "#B87333",
  mostaza: "#D4A017",
  dorado: "#D4AF37",
  naranja: "#E86A33",
  coral: "#FF7F50",
  marron: "#6F4E37",
  "marrón": "#6F4E37",
  cafe: "#6F4E37",
  "café": "#6F4E37",
  chocolate: "#5A3A28",
  vino: "#722F37",
  guinda: "#6E1423",
  rojo: "#C0392B",

  // Rosas y lilas
  rosa: "#E8A0A0",
  "rosa palo": "#E8C4C0",
  "rosa pastel": "#F4C2C2",
  "rosa palido": "#E8C4C0",
  "rosa pálido": "#E8C4C0",
  fucsia: "#D6336C",
  palo_rosa: "#E8C4C0",
  lila: "#C8A2C8",
  morado: "#7D3C98",
  purpura: "#6C3483",
  "púrpura": "#6C3483",

  // Fríos
  celeste: "#A7C7E7",
  azul: "#2E5A88",
  "azul marino": "#22334A",
  turquesa: "#40C4C4",
  verde: "#4F7942",
  "verde oliva": "#6B7043",
  "verde menta": "#A8D5BA",
  aqua: "#7FD4C1",
};

/** Normaliza para buscar: sin tildes, sin mayúsculas, sin espacios de sobra. */
function clave(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Devuelve el hex a mostrar. Prioridad:
 *   1. El que la dueña eligió a mano en el panel.
 *   2. El del diccionario, buscando el nombre completo y luego palabra por
 *      palabra ("Rosa Pastel Suave" cae en "rosa" si no hay algo mejor).
 *   3. Null: sin color confiable no se inventa uno, se muestra el nombre.
 */
export function resolverColor(
  nombre: string,
  hexGuardado?: string | null
): string | null {
  if (hexGuardado && /^#[0-9a-f]{6}$/i.test(hexGuardado)) return hexGuardado;

  const k = clave(nombre);
  if (PALETA[k]) return PALETA[k];

  // Coincidencia parcial: "vestido rosa palo" -> "rosa palo"
  const compuestos = Object.keys(PALETA).filter((c) => c.includes(" "));
  for (const c of compuestos) {
    if (k.includes(c)) return PALETA[c];
  }
  for (const palabra of k.split(" ")) {
    if (PALETA[palabra]) return PALETA[palabra];
  }
  return null;
}

/** Los colores muy claros necesitan borde para verse sobre fondo blanco. */
export function esColorClaro(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Luminancia percibida: el ojo pesa mucho más el verde que el azul.
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.8;
}
