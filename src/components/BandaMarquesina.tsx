import { MARQUESINA } from "@/lib/contenido";

/**
 * Banda oscura con el mensaje desplazándose sin parar.
 *
 * El contenido se repite dos veces y la animación recorre exactamente la mitad
 * del ancho: al terminar, la segunda copia está donde arrancó la primera y el
 * salto es invisible. Con una sola copia se vería el hueco al reiniciar.
 */
export function BandaMarquesina() {
  const copia = (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white md:text-xs">
            {MARQUESINA}
          </span>
          <span aria-hidden className="text-white/40">
            |
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="mt-16 overflow-hidden bg-carbon py-3.5">
      <div className="flex w-max animate-[desfilar_38s_linear_infinite] motion-reduce:animate-none">
        {copia}
        {/* Copia solo decorativa: el texto ya lo anunció la primera. */}
        <div aria-hidden>{copia}</div>
      </div>
    </div>
  );
}
