import { Instagram, MapPin, MessageCircle } from "lucide-react";
import { linkWhatsAppContacto } from "@/lib/whatsapp";

const INSTAGRAM_URL = "https://instagram.com/bithia_brand";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-linea bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="text-lg font-extrabold text-terracota-oscuro">
          Bithia Brand
        </p>
        <p className="mt-1 text-sm text-rosa">
          Moda y estilo con la calidez de Ica.
        </p>

        <h2 className="mt-8 text-sm font-bold text-carbon">Contacto</h2>
        <ul className="mt-3 flex flex-col items-center gap-3 text-sm text-carbon-suave">
          <li>
            <a
              href={linkWhatsAppContacto("¡Hola Bithia Brand! Vengo desde la web 👋")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-terracota"
            >
              <MessageCircle size={16} aria-hidden />
              WhatsApp
            </a>
          </li>
          <li className="inline-flex items-center gap-2">
            <MapPin size={16} aria-hidden />
            Galería Polvos Rosados, Ica
          </li>
          <li>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-terracota"
            >
              <Instagram size={16} aria-hidden />
              Instagram
            </a>
          </li>
        </ul>

        <p className="mt-8 text-xs text-carbon-suave">
          © {new Date().getFullYear()} Bithia Brand. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
