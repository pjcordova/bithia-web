import { Pencil } from "lucide-react";
import Image from "next/image";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import { SeccionVacia } from "@/components/admin/AdminSeccionDestacados";

/**
 * Calco de <BannerEdicionLimitada>: misma banda a tres columnas, mismo alto.
 * El botón "Ver prenda" del público se reemplaza por "Editar prenda".
 */
export function AdminBannerEdicionLimitada({
  producto,
  titulo,
  etiqueta,
  fondo = "bg-rosa-suave/40",
  onEditar,
}: {
  producto: ProductoAdmin | null;
  titulo: string;
  etiqueta: string;
  fondo?: string;
  onEditar: (producto: ProductoAdmin) => void;
}) {
  if (!producto?.imagen_url) {
    return (
      <SeccionVacia titulo={titulo}>
        Ninguna prenda visible está marcada para esta banda todavía. Actívala
        desde su formulario de edición (necesita foto de portada).
      </SeccionVacia>
    );
  }

  return (
    <section className={`mt-16 ${fondo}`}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <Costado src={producto.imagen_url} posicion="left" />

        <div className="flex flex-col items-center justify-center px-6 py-14 text-center md:px-12 md:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-carbon-suave">
            {etiqueta}
          </p>
          <h2 className="mt-4 max-w-md text-2xl font-bold uppercase leading-tight tracking-[0.04em] text-carbon md:text-4xl">
            {producto.nombre}
          </h2>
          <p className="mt-5 text-carbon">
            <span className="align-top text-sm font-semibold">S/ </span>
            <span className="text-3xl font-bold md:text-4xl">
              {producto.precio_venta.toFixed(2)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => onEditar(producto)}
            className="mt-8 inline-flex items-center gap-2 bg-carbon px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-carbon/85"
          >
            <Pencil size={13} />
            Editar prenda
          </button>
          {!producto.disponible && (
            <p className="mt-4 text-xs uppercase tracking-[0.1em] text-rosa">
              Agotada por ahora
            </p>
          )}
        </div>

        <Costado src={producto.imagen_url} posicion="right" soloDesktop />
      </div>
    </section>
  );
}

function Costado({
  src,
  posicion,
  soloDesktop = false,
}: {
  src: string;
  posicion: "left" | "right";
  soloDesktop?: boolean;
}) {
  return (
    <div
      className={`relative h-72 md:h-[38rem] ${soloDesktop ? "hidden md:block" : ""}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 35vw"
        className="object-cover"
        style={{ objectPosition: posicion === "left" ? "25% center" : "75% center" }}
      />
    </div>
  );
}
