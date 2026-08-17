import { hayNumeroWhatsApp, linkWhatsAppContacto } from "@/lib/whatsapp";

const MENSAJE = "¡Hola Bithia Brand! 👋 Vi su catálogo en la web y quisiera consultar.";

/**
 * Botón flotante de contacto. Deliberadamente NO se usa en el carrito: ahí el
 * botón principal ya es "Confirmar pedido por WhatsApp", y un segundo botón
 * verde flotando dejaría en duda si abre el pedido o una conversación nueva.
 */
export function WhatsAppFAB() {
  // Sin número configurado el enlace abriría WhatsApp sin destinatario.
  if (!hayNumeroWhatsApp()) return null;

  return (
    <a
      href={linkWhatsAppContacto(MENSAJE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribirnos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition hover:scale-105 hover:brightness-95 active:scale-95"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden>
        <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4z" />
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
      </svg>
    </a>
  );
}
