"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Camera, Loader2, X } from "lucide-react";
import {
  actualizarProducto,
  crearProducto,
  type ProductoState,
} from "@/app/admin/actions";
import { NOMBRES_CATEGORIA, TALLAS } from "@/lib/categorias";

export type ProductoAdmin = {
  id: string;
  codigo_lote: string;
  nombre: string;
  categoria: string;
  color_principal: string;
  color_hex: string | null;
  descripcion: string | null;
  precio_venta: number;
  imagen_url: string | null;
  visible_en_tienda: boolean;
  disponible: boolean;
  destacado: boolean;
  tallas: string[];
};

function BotonGuardar({ subiendo }: { subiendo: boolean }) {
  const { pending } = useFormStatus();
  const bloqueado = pending || subiendo;
  return (
    <button
      type="submit"
      disabled={bloqueado}
      className="mt-6 w-full rounded-lg bg-terracota py-3.5 text-sm font-bold text-white transition hover:bg-terracota-oscuro disabled:opacity-50"
    >
      {subiendo
        ? "Subiendo foto..."
        : pending
          ? "Guardando..."
          : "Guardar cambios"}
    </button>
  );
}

export function ProductForm({
  producto,
  onCerrar,
}: {
  producto?: ProductoAdmin;
  onCerrar: () => void;
}) {
  const esEdicion = Boolean(producto);
  const router = useRouter();

  const [state, formAction] = useActionState<ProductoState, FormData>(
    esEdicion ? actualizarProducto : crearProducto,
    {}
  );

  const [imagenUrl, setImagenUrl] = useState(producto?.imagen_url ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  // La Server Action revalida las rutas; refrescar trae la lista actualizada.
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

  /**
   * Subida sin firmar: el archivo va del navegador directo a Cloudinary, así
   * las fotos nunca pasan por el servidor de Next ni por Vercel.
   */
  async function subirFoto(archivo: File) {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloud || !preset) {
      setErrorFoto(
        "Falta configurar Cloudinary. Revisa las variables de entorno."
      );
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
      aria-labelledby="titulo-form"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="mx-auto my-4 max-w-lg rounded-tarjeta bg-white p-6 sombra-tarjeta">
        <div className="flex items-center justify-between">
          <h2 id="titulo-form" className="text-xl font-extrabold text-carbon">
            {esEdicion ? "Editar producto" : "Agregar producto"}
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
          {producto && <input type="hidden" name="id" value={producto.id} />}
          <input type="hidden" name="imagen_url" value={imagenUrl} />

          <label
            htmlFor="foto"
            className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-tarjeta border-2 border-dashed border-linea bg-crema text-center transition hover:border-terracota"
          >
            {subiendo ? (
              <Loader2 className="animate-spin text-terracota" size={28} />
            ) : imagenUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={imagenUrl}
                  alt="Vista previa de la prenda"
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
                  Recomendado: PNG o JPG cuadrado
                </span>
              </>
            )}
          </label>
          <input
            id="foto"
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

          <Campo etiqueta="Nombre de la prenda" htmlFor="nombre">
            <input
              id="nombre"
              name="nombre"
              required
              defaultValue={producto?.nombre}
              placeholder="Ej. Blusa de Seda"
              className={ENTRADA}
            />
          </Campo>

          <Campo etiqueta="Categoría" htmlFor="categoria">
            <select
              id="categoria"
              name="categoria"
              required
              defaultValue={producto?.categoria ?? ""}
              className={ENTRADA}
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {NOMBRES_CATEGORIA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            etiqueta="Color principal"
            htmlFor="color_principal"
            ayuda="El nombre es el que ve la clienta. El cuadrito de al lado define el punto de color de la tarjeta; si lo dejas en blanco lo deducimos del nombre."
          >
            <div className="mt-2 flex gap-2">
              <input
                id="color_principal"
                name="color_principal"
                required
                defaultValue={producto?.color_principal}
                placeholder="Ej. Rosa pálido"
                className={`${ENTRADA} mt-0 flex-1`}
              />
              <input
                type="color"
                name="color_hex"
                aria-label="Punto de color de la prenda"
                defaultValue={producto?.color_hex ?? "#c9a48d"}
                className="mt-0 h-[46px] w-14 shrink-0 cursor-pointer rounded-lg border border-linea bg-crema p-1"
              />
            </div>
          </Campo>

          <Campo etiqueta="Descripción" htmlFor="descripcion">
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              defaultValue={producto?.descripcion ?? ""}
              placeholder="Ej. Vestido midi de lino, ideal para el día a día..."
              className={`${ENTRADA} resize-y`}
            />
          </Campo>

          <Campo etiqueta="Precio de venta (S/)" htmlFor="precio_venta">
            <input
              id="precio_venta"
              name="precio_venta"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={producto?.precio_venta}
              placeholder="0.00"
              className={ENTRADA}
            />
          </Campo>

          <Campo
            etiqueta="Código de lote"
            htmlFor="codigo_lote"
            ayuda={
              esEdicion
                ? "Cámbialo solo si sabes lo que haces: es la referencia contra el ERP."
                : "Déjalo vacío y se genera solo (ej. VES-2508-03)."
            }
          >
            <input
              id="codigo_lote"
              name="codigo_lote"
              defaultValue={producto?.codigo_lote ?? ""}
              placeholder="Se genera automáticamente"
              className={`${ENTRADA} uppercase`}
            />
          </Campo>

          <fieldset className="mt-5">
            <legend className="text-[11px] font-bold uppercase tracking-wide text-terracota-oscuro">
              Tallas disponibles
            </legend>
            <p className="mt-1 text-xs text-carbon-suave">
              Marca las tallas que manejas de esta prenda.
            </p>
            <div className="mt-3 flex gap-3">
              {TALLAS.map((t) => (
                <label
                  key={t}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-linea bg-crema py-3 text-sm font-semibold text-carbon transition has-[:checked]:border-terracota has-[:checked]:bg-terracota has-[:checked]:text-white"
                >
                  <input
                    type="checkbox"
                    name={`talla_${t}`}
                    defaultChecked={producto?.tallas.includes(t) ?? false}
                    className="sr-only"
                  />
                  Talla {t}
                </label>
              ))}
            </div>
          </fieldset>

          <Interruptor
            name="disponible"
            etiqueta="Disponible"
            ayuda="Desactívalo para mostrar la prenda como “Agotado” sin ocultarla."
            defaultChecked={producto?.disponible ?? true}
          />

          <Interruptor
            name="destacado"
            etiqueta="Mostrar en “Los más pedidos”"
            ayuda="Aparece en la fila destacada de la portada. Márcalo en las prendas que más te piden por WhatsApp — no se calcula solo, tú decides cuáles son."
            defaultChecked={producto?.destacado ?? false}
          />

          <Interruptor
            name="visible_en_tienda"
            etiqueta="Producto visible en la tienda"
            ayuda="Actívalo cuando quieras mostrar esta prenda en la web, aunque no tengas stock. Desactívalo para ocultarla temporalmente."
            defaultChecked={producto?.visible_en_tienda ?? true}
          />

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
      </div>
    </div>
  );
}

const ENTRADA =
  "mt-2 w-full rounded-lg border border-linea bg-crema px-4 py-3 text-sm text-carbon placeholder:text-carbon-suave focus:border-terracota focus:outline-none";

function Campo({
  etiqueta,
  htmlFor,
  ayuda,
  children,
}: {
  etiqueta: string;
  htmlFor: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-bold uppercase tracking-wide text-terracota-oscuro"
      >
        {etiqueta}
      </label>
      {children}
      {ayuda && <p className="mt-1.5 text-xs text-carbon-suave">{ayuda}</p>}
    </div>
  );
}

function Interruptor({
  name,
  etiqueta,
  ayuda,
  defaultChecked,
}: {
  name: string;
  etiqueta: string;
  ayuda: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="mt-6 flex cursor-pointer gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-linea transition peer-checked:bg-terracota after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      <span>
        <span className="block text-sm font-semibold text-carbon">
          {etiqueta}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-carbon-suave">
          {ayuda}
        </span>
      </span>
    </label>
  );
}
