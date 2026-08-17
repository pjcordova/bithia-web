/** Precio en soles, siempre con dos decimales: "S/ 145.00". */
export function formatSoles(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

/** Una prenda es "nueva" durante su primer ciclo de mercadería (~15 días). */
export function esNueva(createdAt: Date): boolean {
  const quinceDias = 15 * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt.getTime() < quinceDias;
}
