"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, X } from "lucide-react";
import { guardarFotoCategoria } from "@/app/admin/actions";

/**
 * Elige la foto de un mosaico de categoría.
 *
 * Quitarla no deja el mosaico vacío: vuelve al comportamiento automático, que
 * es heredar la foto de la prenda más reciente de esa categoría. Se dice
 * explícitamente porque "quitar" normalmente significa "desaparece", y acá no.
 */
export function CategoriaFotoForm({
  nombre,
  fotoActual,
  esFotoFijada,
  onCerrar,
}: {
  nombre: string;
  fotoActual: string | null;
  /** true si la foto actual se eligió a mano; false si viene heredada. */
  esFotoFijada: boolean;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [guardando, iniciarGuardado] = useTransition();
  const [fotoUrl, setFotoUrl] = useState(esFotoFijada ? (fotoActual ?? "") : "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Falta configurar Cloudinary. Revisa las variables de entorno.");
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setError("La foto pesa más de 10 MB. Usa una más liviana.");
      return;
    }

    setError(null);
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
      setError("No se pudo subir la foto. Revisa tu conexión y reintenta.");
    } finally {
      setSubiendo(false);
    }
  }

  function guardar(url: string | null) {
    iniciarGuardado(async () => {
      await guardarFotoCategoria(nombre, url);
      router.refresh();
      onCerrar();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-carbon/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-categoria-foto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="mx-auto my-4 max-w-md rounded-tarjeta bg-white p-6 sombra-tarjeta">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="titulo-categoria-foto"
              className="text-xl font-extrabold text-carbon"
            >
              Foto de “{nombre}”
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-carbon-suave">
              {esFotoFijada
                ? "Esta categoría tiene una foto elegida a mano."
                : "Ahora mismo hereda la foto de la prenda más reciente de esta categoría. Si eliges una, deja de cambiar sola."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md p-1 text-carbon-suave transition hover:text-carbon"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <label
          htmlFor="foto-categoria"
          className="mx-auto mt-5 flex aspect-[3/4] max-w-[14rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-tarjeta border-2 border-dashed border-linea bg-crema text-center transition hover:border-terracota"
        >
          {subiendo ? (
            <Loader2 className="animate-spin text-terracota" size={26} />
          ) : fotoUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={fotoUrl}
                alt={`Vista previa de ${nombre}`}
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
          ) : (
            <>
              <Camera className="text-carbon-suave" size={26} aria-hidden />
              <span className="mt-2 px-4 text-xs text-terracota-oscuro">
                Toca para subir una foto
              </span>
            </>
          )}
        </label>
        <input
          id="foto-categoria"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) subirFoto(archivo);
          }}
        />

        {error && (
          <p role="alert" className="mt-3 text-center text-xs text-rosa">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => guardar(fotoUrl || null)}
          disabled={guardando || subiendo || !fotoUrl}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-terracota py-3.5 text-sm font-bold text-white transition hover:bg-terracota-oscuro disabled:opacity-50"
        >
          {guardando && <Loader2 size={16} className="animate-spin" />}
          {guardando ? "Guardando..." : "Usar esta foto"}
        </button>

        {esFotoFijada && (
          <button
            type="button"
            onClick={() => guardar(null)}
            disabled={guardando}
            className="mt-2 w-full rounded-lg border border-linea py-3 text-sm font-semibold text-carbon-suave transition hover:text-carbon disabled:opacity-50"
          >
            Volver a la foto automática
          </button>
        )}
      </div>
    </div>
  );
}
