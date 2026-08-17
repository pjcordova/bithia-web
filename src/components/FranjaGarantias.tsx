import { CalendarClock, MapPin, MessageCircleHeart, Truck } from "lucide-react";
import { GARANTIAS } from "@/lib/contenido";

const ICONOS = {
  tienda: MapPin,
  envio: Truck,
  renovacion: CalendarClock,
  asesoria: MessageCircleHeart,
};

/** Franja oscura con los cuatro argumentos de compra, bajo la foto del local. */
export function FranjaGarantias() {
  // El margen superior despega la franja de la foto del local: pegadas, la
  // banda oscura se leía como el borde inferior de la imagen.
  return (
    <section className="mt-16 bg-carbon py-12" aria-label="Cómo compras en Bithia">
      <h2 className="sr-only">Cómo compras en Bithia</h2>
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:gap-6">
        {GARANTIAS.map((g) => {
          const Icono = ICONOS[g.icono];
          return (
            <li key={g.titulo} className="flex flex-col items-center text-center">
              <Icono
                size={34}
                strokeWidth={1.25}
                className="text-white"
                aria-hidden
              />
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                {g.titulo}
              </p>
              <p className="mt-2 max-w-[15rem] text-xs leading-relaxed text-white/70">
                {g.detalle}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
