"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Camera, Loader2, X } from "lucide-react";
import { guardarTienda, type TiendaState } from "@/app/admin/actions";
import type { Tienda } from "@/lib/tienda";

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
 * Edita la foto del stand, cómo se llama el local y dónde queda. Estos datos
 * salen en el banner del final de la portada y en el pie de todas las páginas,
 * así que un cambio acá se ve en todo el sitio.
 */
export function TiendaForm({
  tienda,
  onCerrar,
}: {
  tienda: Tienda;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<TiendaState, FormData>(
    guardarTienda,
    {}
  );

  const [fotoUrl, setFotoUrl] = useState(tienda.foto_url ?? "");
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
      setFotoUrl(data.secure_url);
    } catch {
      setErrorFoto("No se pudo subir la foto. Revisa tu conexión y reintenta.");
    } finally {
      setSubiendo(false);
    }
  }

  const etiqueta =
    "mt-4 block text-xs font-semibold uppercase tracking-wide text-carbon-suave";
  const campo =
    "mt-1.5 w-full rounded-lg border border-linea px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-carbon outline-none focus:border-terracota";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-carbon/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-tienda-form"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="mx-auto my-4 max-w-lg rounded-tarjeta bg-white p-6 sombra-tarjeta">
        <div className="flex items-center justify-between">
          <h2
            id="titulo-tienda-form"
            className="text-xl font-extrabold text-carbon"
          >
            Editar la tienda
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
        <p className="mt-1 text-xs text-carbon-suave">
          Se ve al final de la portada y en el pie de todas las páginas.
        </p>

        <form action={formAction} className="mt-5">
          <input type="hidden" name="foto_url" value={fotoUrl} />

          {/* Apaisada, como se ve en la portada. */}
          <label
            htmlFor="foto-tienda"
            className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-tarjeta border-2 border-dashed border-linea bg-crema text-center transition hover:border-terracota"
          >
            {subiendo ? (
              <Loader2 className="animate-spin text-terracota" size={28} />
            ) : fotoUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={fotoUrl}
                  alt="Vista previa del stand"
                  fill
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="object-cover"
                />
              </div>
            ) : (
              <>
                <Camera className="text-carbon-suave" size={28} aria-hidden />
                <span className="mt-2 px-4 text-xs text-terracota-oscuro">
                  Toca para subir la foto del stand
                  <br />
                  Sin foto, esta sección no se muestra
                </span>
              </>
            )}
          </label>
          <input
            id="foto-tienda"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subirFoto(archivo);
            }}
          />
          {fotoUrl && !subiendo && (
            <button
              type="button"
              onClick={() => setFotoUrl("")}
              className="mt-2 text-xs text-rosa underline"
            >
              Quitar la foto
            </button>
          )}
          {errorFoto && (
            <p role="alert" className="mt-2 text-xs text-rosa">
              {errorFoto}
            </p>
          )}

          <label className={etiqueta}>
            Nombre del local
            <input
              type="text"
              name="nombre"
              defaultValue={tienda.nombre}
              required
              className={campo}
            />
          </label>

          <label className={etiqueta}>
            Ciudad
            <input
              type="text"
              name="ciudad"
              defaultValue={tienda.ciudad}
              required
              className={campo}
            />
          </label>

          <label className={etiqueta}>
            Enlace de Google Maps
            <input
              type="url"
              name="mapa_url"
              defaultValue={tienda.mapa_url}
              required
              className={campo}
            />
            <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-carbon-suave">
              Es a donde lleva el botón “Visítanos”.
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
