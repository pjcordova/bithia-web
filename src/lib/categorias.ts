// Categorías fijas del catálogo. El prefijo alimenta el código de lote
// (VES-2508-03) que el personal usa para verificar stock contra el ERP.
export const CATEGORIAS = [
  { nombre: "Vestidos", prefijo: "VES" },
  { nombre: "Blusas", prefijo: "BLU" },
  { nombre: "Faldas", prefijo: "FAL" },
  { nombre: "Pantalones", prefijo: "PAN" },
  { nombre: "Blazers", prefijo: "BLA" },
  { nombre: "Tops", prefijo: "TOP" },
] as const;

// `string[]` y no la unión de literales: se compara contra lo que llega de un
// formulario, que siempre es string.
export const NOMBRES_CATEGORIA: readonly string[] = CATEGORIAS.map(
  (c) => c.nombre
);

export const TALLAS = ["S", "M", "L"] as const;
export type Talla = (typeof TALLAS)[number];

export function prefijoDe(categoria: string): string {
  return (
    CATEGORIAS.find((c) => c.nombre === categoria)?.prefijo ??
    categoria.slice(0, 3).toUpperCase()
  );
}
