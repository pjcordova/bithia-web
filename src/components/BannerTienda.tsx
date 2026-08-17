import Image from "next/image";
import { TIENDA } from "@/lib/contenido";

/**
 * Foto ancha del local con un botón encima.
 *
 * Cierra la portada con la prueba de que detrás de la web hay una tienda real
 * en la que te puedes probar la ropa — que para una boutique de galería es el
 * argumento más fuerte que tiene.
 */
export function BannerTienda() {
  return (
    <section className="relative mt-20" aria-label="Nuestra tienda">
      <div className="relative h-[26rem] w-full overflow-hidden md:h-[34rem]">
        <Image
          src={TIENDA.foto}
          alt={`Stand de Bithia Brand en ${TIENDA.nombre}, ${TIENDA.ciudad}`}
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Velo suave: el botón tiene que leerse sobre cualquier foto. */}
        <div className="absolute inset-0 bg-carbon/15" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <a
            href={TIENDA.mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-carbon px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-carbon/85"
          >
            Visítanos
          </a>
          <p className="text-sm font-medium text-white drop-shadow">
            {TIENDA.nombre} · {TIENDA.ciudad}
          </p>
        </div>
      </div>
    </section>
  );
}
