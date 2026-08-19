"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Camera, Loader2, Trash2, X } from "lucide-react";
import {
  actualizarSlide,
  crearSlide,
  eliminarSlide,
  type SlideState,
} from "@/app/admin/actions";
import type { HeroSlide } from "@/lib/hero";

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

export function SlideForm({
  slide,
  onCerrar,
}: {
  slide?: HeroSlide;
  onCerrar: () => void;
}) {
  const esEdicion = Boolean(slide);
  const router = useRouter();

  const [state, formAction] = useActionState<SlideState, FormData>(
    esEdicion ? actualizarSlide : crearSlide,
    {}
  );

  const [imagenUrl, setImagenUrl] = useState(slide?.imagen_url ?? "");
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
      aria-labelledby="titulo-slide-form"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="mx-auto my-4 max-w-lg rounded-tarjeta bg-white p-6 sombra-tarjeta">
        <div className="flex items-center justify-between">
          <h2 id="titulo-slide-form" className="text-xl font-extrabold text-carbon">
            {esEdicion ? "Editar diapositiva" : "Agregar diapositiva"}
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
          {slide && <input type="hidden" name="id" value={slide.id} />}
          <input type="hidden" name="imagen_url" value={imagenUrl} />

          <label
            htmlFor="foto-slide"
            className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-tarjeta border-2 border-dashed border-linea bg-crema text-center transition hover:border-terracota"
          >
            {subiendo ? (
              <Loader2 className="animate-spin text-terracota" size={28} />
            ) : imagenUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={imagenUrl}
                  alt="Vista previa de la diapositiva"
                  fill
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="object-cover"
                />
              </div>
            ) : (
              <>
                <Camera className="text-carbon-suave" size={28} aria-hidden />
                <span className="mt-2 px-4 text-xs text-terracota-oscuro">
                  Toca para subir una foto
                  <br />
                  Sin foto se usa un degradado de marca
                </span>
              </>
            )}
          </label>
          <input
            id="foto-slide"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subirFoto(archivo);
            }}
          />
          {imagenUrl && !subiendo && (
            <button
              type="button"
              onClick={() => setImagenUrl("")}
              className="mt-2 text-xs text-rosa underline"
            >
              Quitar foto
            </button>
          )}
          {errorFoto && (
            <p role="alert" className="mt-2 text-xs text-rosa">
              {errorFoto}
            </p>
          )}

          <Campo
            label="Etiqueta (opcional)"
            name="etiqueta"
            defaultValue={slide?.etiqueta ?? ""}
            placeholder="Nueva colección"
          />
          <Campo
            label="Título"
            name="titulo"
            defaultValue={slide?.titulo ?? ""}
            placeholder="Renueva tu estilo con Bithia"
            requerido
          />
          <div className="mt-4">
            <label className="text-xs font-bold uppercase tracking-wide text-carbon">
              Subtítulo (opcional)
            </label>
            <textarea
              name="subtitulo"
              defaultValue={slide?.subtitulo ?? ""}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-linea bg-crema px-3 py-2.5 text-sm text-carbon outline-none focus:border-terracota"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo
              label="Texto del botón"
              name="cta_texto"
              defaultValue={slide?.cta_texto ?? "Ver catálogo"}
              requerido
            />
            <Campo
              label="Destino del botón"
              name="cta_href"
              defaultValue={slide?.cta_href ?? "/catalogo"}
              placeholder="/catalogo"
              requerido
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Campo
              label="Orden (menor va primero)"
              name="orden"
              type="number"
              defaultValue={String(slide?.orden ?? 0)}
            />
            <Campo
              label="Velo sobre la foto (0 a 1)"
              name="velo"
              type="number"
              defaultValue={String(slide?.velo ?? 0.35)}
            />
          </div>

          <label className="mt-4 flex items-start gap-2.5 rounded-lg border border-linea bg-crema p-3">
            <input
              type="checkbox"
              name="activo"
              defaultChecked={slide?.activo ?? true}
              className="mt-0.5 h-4 w-4 accent-terracota"
            />
            <span className="text-xs text-carbon-suave">
              <span className="block text-sm font-semibold text-carbon">
                Diapositiva activa
              </span>
              Desactívala para guardarla sin que aparezca todavía en el
              carrusel.
            </span>
          </label>

          {state.error && (
            <p role="alert" className="mt-4 text-sm text-rosa">
              {state.error}
            </p>
          )}

          <BotonGuardar subiendo={subiendo} />

          <button
            type="button"
            onClick={onCerrar}
            className="mt-3 w-full py-2 text-sm font-medium text-carbon-suave transition hover:text-carbon"
          >
            Cancelar
          </button>
        </form>

        {esEdicion && slide && (
          <form
            action={eliminarSlide}
            onSubmit={(e) => {
              if (
                !confirm(
                  `¿Eliminar la diapositiva "${slide.titulo}"? Esta acción no se puede deshacer.`
                )
              ) {
                e.preventDefault();
              }
            }}
            className="mt-2 border-t border-linea pt-4"
          >
            <input type="hidden" name="id" value={slide.id} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-carbon-suave transition hover:text-rosa"
            >
              <Trash2 size={14} />
              Eliminar esta diapositiva
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  placeholder,
  requerido,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  requerido?: boolean;
  type?: string;
}) {
  return (
    <div className="mt-4">
      <label
        htmlFor={name}
        className="text-xs font-bold uppercase tracking-wide text-carbon"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={requerido}
        step={type === "number" ? "0.05" : undefined}
        className="mt-1.5 w-full rounded-lg border border-linea bg-crema px-3 py-2.5 text-sm text-carbon outline-none focus:border-terracota"
      />
    </div>
  );
}
