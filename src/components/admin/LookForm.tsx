"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Camera, Loader2, X } from "lucide-react";
import { actualizarLook, type LookState } from "@/app/admin/actions";
import type { AdminLook } from "@/components/admin/AdminSeccionShopTheLook";

function BotonGuardar({ subiendo }: { subiendo: boolean }) {
  const { pending } = useFormStatus();
  const bloqueado = pending || subiendo;
  return (
    <button
      type="submit"
      disabled={bloqueado}
      className="mt-6 w-full rounded-lg bg-terracota py-3.5 text-sm font-bold text-white transition hover:bg-terracota-oscuro disabled:opacity-50"
    >
      {subiendo ? "Subiendo foto..." : pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

/**
 * Edita la foto grande y los textos de la sección "Shop the look" de la
 * portada. Las prendas que aparecen sobre la foto se editan desde sus propias
 * tarjetas, como en el resto del panel.
 */
export function LookForm({
  look,
  onCerrar,
}: {
  look: AdminLook;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<LookState, FormData>(
    actualizarLook,
    {}
  );

  const [imagenUrl, setImagenUrl] = useState(look.imagen_url);
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
      onCerrar();
    }
  }, [state.ok, router, onCerrar]);

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

  async function subirFoto(archivo: File) {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setErrorFoto("Falta configurar Cloudinary. Revisa las variables de entorno.");
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setErrorFoto("La foto pesa más de 10 MB. Usa una más liviana.");
      return;
    }

    setErrorFoto(null);
    setSubiendo(true);
    try {
      const cuerpo = new FormData();
      cuerpo.append("file", archivo);
      cuerpo.append("upload_preset", preset);
      cuerpo.append("folder", "bithia-web");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
        { method: "POST", body: cuerpo }
      );
      if (!res.ok) throw new Error(String(res.status));

      const data: { secure_url?: string } = await res.json();
      if (!data.secure_url) throw new Error("respuesta sin secure_url");
      setImagenUrl(data.secure_url);
    } catch {
      setErrorFoto("No se pudo subir la foto. Revisa tu conexión y reintenta.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-carbon/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-look-form"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="mx-auto my-4 max-w-lg rounded-tarjeta bg-white p-6 sombra-tarjeta">
        <div className="flex items-center justify-between">
          <h2 id="titulo-look-form" className="text-xl font-extrabold text-carbon">
            Editar “Shop the look”
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md p-1 text-carbon-suave transition hover:text-carbon"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form action={formAction} className="mt-5">
          <input type="hidden" name="id" value={look.id} />
          <input type="hidden" name="imagen_url" value={imagenUrl} />

          {/* Vertical, como se ve en la portada: así la dueña juzga el encuadre
              real y no una versión apaisada que después se recorta. */}
          <label
            htmlFor="foto-look"
            className="mx-auto flex aspect-[3/4] max-w-[16rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-tarjeta border-2 border-dashed border-linea bg-crema text-center transition hover:border-terracota"
          >
            {subiendo ? (
              <Loader2 className="animate-spin text-terracota" size={28} />
            ) : imagenUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={imagenUrl}
                  alt="Vista previa de la foto del look"
                  fill
                  sizes="256px"
                  className="object-cover"
                />
              </div>
            ) : (
              <>
                <Camera className="text-carbon-suave" size={28} aria-hidden />
                <span className="mt-2 px-4 text-xs text-terracota-oscuro">
                  Toca para subir la foto
                </span>
              </>
            )}
          </label>
          <input
            id="foto-look"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subirFoto(archivo);
            }}
          />
          {errorFoto && (
            <p role="alert" className="mt-2 text-center text-xs text-rosa">
              {errorFoto}
            </p>
          )}

          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-carbon-suave">
            Título de la sección
            <input
              type="text"
              name="titulo"
              defaultValue={look.titulo}
              required
              className="mt-1.5 w-full rounded-lg border border-linea px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-carbon outline-none focus:border-terracota"
            />
          </label>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-carbon-suave">
            Firma vertical
            <input
              type="text"
              name="etiqueta"
              defaultValue={look.etiqueta ?? ""}
              className="mt-1.5 w-full rounded-lg border border-linea px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-carbon outline-none focus:border-terracota"
            />
            <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-carbon-suave">
              Texto girado al costado de la foto, solo visible en computadora.
              Déjalo vacío para ocultarlo.
            </span>
          </label>

          {state.error && (
            <p role="alert" className="mt-4 text-sm text-rosa">
              {state.error}
            </p>
          )}

          <BotonGuardar subiendo={subiendo} />
        </form>
      </div>
    </div>
  );
}
