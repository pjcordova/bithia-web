"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, Upload, X } from "lucide-react";
import type { CartItem } from "@/lib/cart-store";
import { construirLinkWhatsApp } from "@/lib/whatsapp";
import { METODOS_PAGO, ORDEN_METODOS, type MetodoPagoId } from "@/lib/pagos";
import { registrarDescuentoStock } from "@/app/carrito/actions";

/**
 * Paso 2 del carrito: elegir método de pago y adjuntar el comprobante antes
 * de recién mostrar el botón de WhatsApp. El pedido sigue sin guardarse en
 * base de datos — WhatsApp sigue siendo el registro, ahora con el método de
 * pago y el link del comprobante incluidos en el mensaje.
 */
export function MetodoPagoSelector({
  items,
  bloqueado,
  revalidarStock,
  onPedidoEnviado,
}: {
  items: CartItem[];
  /** true si alguna línea del carrito ya no tiene stock suficiente. */
  bloqueado: boolean;
  /** Vuelve a preguntarle al ERP; se llama al abrir el modal de pago. */
  revalidarStock: () => void;
  onPedidoEnviado: () => void;
}) {
  const [mostrarMetodos, setMostrarMetodos] = useState(false);
  const [metodoActivo, setMetodoActivo] = useState<MetodoPagoId | null>(null);

  return (
    <div className="mt-5">
      {!mostrarMetodos ? (
        <button
          type="button"
          onClick={() => setMostrarMetodos(true)}
          disabled={bloqueado}
          // Mismo tono que el título "Tu Carrito", con el gris carbón de la
          // paleta al pasar el cursor — así el CTA principal se lee como una
          // extensión del encabezado de la página.
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-terracota-oscuro py-4 text-sm font-bold text-white transition hover:bg-carbon disabled:pointer-events-none disabled:opacity-40"
        >
          Continuar compra
        </button>
      ) : (
        <div>
          <p className="text-center text-sm font-semibold text-carbon">
            ¿Cómo vas a pagar?
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {ORDEN_METODOS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setMetodoActivo(id)}
                className="rounded-lg border border-linea bg-white py-3 text-sm font-semibold text-carbon transition hover:border-terracota hover:text-terracota-oscuro"
              >
                {METODOS_PAGO[id].etiqueta}
              </button>
            ))}
          </div>
        </div>
      )}

      {metodoActivo && (
        <ModalPago
          metodoId={metodoActivo}
          items={items}
          bloqueado={bloqueado}
          revalidarStock={revalidarStock}
          onCerrar={() => setMetodoActivo(null)}
          onEnviado={onPedidoEnviado}
        />
      )}
    </div>
  );
}

function ModalPago({
  metodoId,
  items,
  bloqueado,
  revalidarStock,
  onCerrar,
  onEnviado,
}: {
  metodoId: MetodoPagoId;
  items: CartItem[];
  bloqueado: boolean;
  revalidarStock: () => void;
  onCerrar: () => void;
  onEnviado: () => void;
}) {
  const metodo = METODOS_PAGO[metodoId];
  const [copiado, setCopiado] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Intento de abrir el app correspondiente. Son esquemas no oficiales (los
  // bancos no publican deep-linking para terceros): en el celular puede que
  // sí abra, en desktop no hará nada — por eso el panel con el dato para
  // copiar está siempre visible, no depende de que esto funcione.
  useEffect(() => {
    try {
      window.location.href = metodo.deepLink;
    } catch {
      // Esquema no soportado por el navegador: se ignora, ya está el
      // respaldo manual abajo.
    }
  }, [metodo.deepLink]);

  // Última verificación antes de que pague: entre que armó el carrito y llegó
  // acá pudieron venderse esas unidades en el mostrador. Es una sola consulta,
  // en el momento en que de verdad importa.
  useEffect(() => {
    revalidarStock();
  }, [revalidarStock]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onCerrar]);

  async function copiarDato() {
    try {
      await navigator.clipboard.writeText(metodo.dato);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el número ya está visible en pantalla
      // para copiarlo a mano.
    }
  }

  async function onArchivoElegido(archivo: File | undefined) {
    if (!archivo) return;
    setErrorSubida(null);
    setComprobanteUrl(null);
    setPreviewUrl(URL.createObjectURL(archivo));

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setErrorSubida("Falta configurar Cloudinary. Revisa las variables de entorno.");
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setErrorSubida("La imagen pesa más de 10 MB. Usa una más liviana.");
      return;
    }

    setSubiendo(true);
    try {
      const cuerpo = new FormData();
      cuerpo.append("file", archivo);
      cuerpo.append("upload_preset", preset);
      cuerpo.append("folder", "bithia-web/comprobantes");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        { method: "POST", body: cuerpo }
      );
      if (!res.ok) throw new Error(String(res.status));

      const data: { secure_url?: string } = await res.json();
      if (!data.secure_url) throw new Error("respuesta sin secure_url");
      setComprobanteUrl(data.secure_url);
    } catch {
      setErrorSubida(
        "No se pudo subir la captura. Revisa tu conexión y vuelve a intentar."
      );
    } finally {
      setSubiendo(false);
    }
  }

  const linkWhatsApp = construirLinkWhatsApp(items, {
    metodo,
    comprobanteUrl: comprobanteUrl ?? undefined,
  });

  // Hace falta el comprobante y que el stock siga alcanzando: la revalidación
  // de arriba puede haber encontrado que algo se agotó recién.
  const puedeEnviar = Boolean(comprobanteUrl) && !bloqueado;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-carbon/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-pago"
      onClick={onCerrar}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 sm:max-w-sm sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 id="titulo-modal-pago" className="text-lg font-extrabold text-carbon">
            Pagar con {metodo.etiqueta}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-carbon-suave transition hover:text-carbon"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-1 text-xs text-carbon-suave">
          {metodo.tipo === "billetera"
            ? "Si tienes la app instalada, puede que se haya abierto sola. Si no, usa estos datos:"
            : "Usa estos datos para hacer la transferencia:"}
        </p>

        <div className="mt-4 rounded-tarjeta bg-crema p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-carbon-suave">
            {metodo.tipo === "billetera" ? "Número" : "CCI"}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-lg font-extrabold text-terracota-oscuro">
              {metodo.dato}
            </p>
            <button
              type="button"
              onClick={copiarDato}
              className="flex items-center gap-1 rounded-full border border-terracota px-3 py-1.5 text-xs font-semibold text-terracota-oscuro transition hover:bg-terracota hover:text-white"
            >
              {copiado ? <Check size={14} /> : <Copy size={14} />}
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 text-xs text-carbon-suave">
            Titular: {metodo.titular}
          </p>
        </div>

        <div className="mt-5 border-t border-linea pt-5">
          <p className="text-sm font-semibold text-carbon">
            ¿Ya pagaste? Adjunta tu comprobante
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onArchivoElegido(e.target.files?.[0])}
          />

          {!previewUrl ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-linea py-6 text-xs text-carbon-suave transition hover:border-terracota hover:text-terracota-oscuro"
            >
              <Upload size={20} />
              Subir captura del pago
            </button>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              {/* Vista previa local (blob:): no pasa por Cloudinary hasta
                  que la subida termina, por eso no se usa next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Vista previa del comprobante"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1 text-xs">
                {subiendo && (
                  <span className="flex items-center gap-1.5 text-carbon-suave">
                    <Loader2 size={14} className="animate-spin" />
                    Subiendo captura...
                  </span>
                )}
                {comprobanteUrl && !subiendo && (
                  <span className="flex items-center gap-1.5 font-semibold text-terracota-oscuro">
                    <Check size={14} />
                    Comprobante listo
                  </span>
                )}
                {errorSubida && !subiendo && (
                  <span className="text-rosa">{errorSubida}</span>
                )}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-1 block text-carbon-suave underline underline-offset-2"
                >
                  Cambiar imagen
                </button>
              </div>
            </div>
          )}
        </div>

        {bloqueado && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-rosa-suave/60 p-3 text-center text-xs font-semibold text-terracota-oscuro"
          >
            Se acaba de agotar una de las prendas de tu pedido. Cierra esta
            ventana y ajusta tu carrito antes de pagar.
          </p>
        )}

        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!puedeEnviar}
          onClick={(e) => {
            if (!puedeEnviar) {
              e.preventDefault();
              return;
            }
            // No se espera la respuesta: el pedido ya sale por WhatsApp pase
            // lo que pase con el ERP. Mientras no exista el endpoint del
            // otro lado, esto simplemente no hace nada (ver lib/erp.ts).
            registrarDescuentoStock(
              items.map((i) => ({
                codigo_lote: i.codigoLote,
                talla: i.talla,
                cantidad: i.cantidad,
              })),
              metodoId
            );
            onEnviado();
          }}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp py-4 text-sm font-bold text-white transition ${
            puedeEnviar ? "hover:brightness-95" : "pointer-events-none opacity-40"
          }`}
        >
          Enviar pedido por WhatsApp
        </a>
        {!comprobanteUrl && !bloqueado && (
          <p className="mt-2 text-center text-[11px] text-carbon-suave">
            Adjunta la captura del pago para habilitar el envío.
          </p>
        )}
      </div>
    </div>
  );
}
