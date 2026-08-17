import Link from "next/link";
import { Instagram, MapPin, MessageCircle } from "lucide-react";
import { linkWhatsAppContacto, numeroWhatsApp } from "@/lib/whatsapp";
import { CATEGORIAS } from "@/lib/categorias";
import { ENLACES_LEGALES, INSTAGRAM_URL, TIENDA } from "@/lib/contenido";

/** Muestra el número tal como se marca en Perú: 999 999 999. */
function numeroLegible(): string | null {
  const n = numeroWhatsApp();
  if (n.length < 11) return null;
  const local = n.slice(2); // sin el 51
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

export function Footer() {
  const telefono = numeroLegible();

  return (
    <footer className="border-t border-linea bg-crema">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {/* --- Marca --- */}
          <div>
            <p className="text-lg font-semibold uppercase tracking-[0.25em] text-terracota-oscuro">
              Bithia
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-carbon-suave">
              Moda femenina con la calidez de Ica. Prendas exclusivas y unidades
              limitadas, renovadas cada 15 días.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Bithia Brand"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-linea text-carbon transition hover:border-terracota hover:text-terracota"
              >
                <Instagram size={16} />
              </a>
              <a
                href={linkWhatsAppContacto(
                  "¡Hola Bithia Brand! 👋 Vengo desde la web."
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de Bithia Brand"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-linea text-carbon transition hover:border-terracota hover:text-terracota"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* --- Catálogo --- */}
          <nav aria-labelledby="pie-catalogo">
            <h2
              id="pie-catalogo"
              className="text-[11px] font-bold uppercase tracking-[0.15em] text-carbon"
            >
              Catálogo
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {CATEGORIAS.map((c) => (
                <li key={c.nombre}>
                  <Link
                    href={`/catalogo?categoria=${encodeURIComponent(c.nombre)}`}
                    className="text-sm text-carbon-suave transition hover:text-terracota"
                  >
                    {c.nombre}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/catalogo"
                  className="text-sm font-medium text-terracota-oscuro transition hover:text-terracota"
                >
                  Ver todo
                </Link>
              </li>
            </ul>
          </nav>

          {/* --- Contacto --- */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-carbon">
              Visítanos
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-carbon-suave">
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />
                <a
                  href={TIENDA.mapa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-terracota"
                >
                  {TIENDA.nombre}
                  <br />
                  {TIENDA.ciudad}
                </a>
              </li>
              {telefono && (
                <li className="flex gap-2.5">
                  <MessageCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                  <a
                    href={linkWhatsAppContacto()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-terracota"
                  >
                    {telefono}
                    <span className="block text-xs">
                      Pedidos y consultas por WhatsApp
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* --- Barra inferior --- */}
        <div className="mt-12 flex flex-col gap-4 border-t border-linea pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-carbon-suave">
            © {new Date().getFullYear()} Bithia Brand. Todos los derechos
            reservados.
          </p>

          {/* Solo se listan los enlaces que tienen destino: uno que apunta a una
              política inexistente es peor que no ofrecerla. */}
          {ENLACES_LEGALES.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {ENLACES_LEGALES.map((e) => (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    className="text-xs text-carbon-suave underline transition hover:text-terracota"
                  >
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
