import Image from "next/image";
import { obtenerTienda, type Tienda } from "@/lib/tienda";

/**
 * Foto ancha del local con un botón encima.
 *
 * Cierra la portada con la prueba de que detrás de la web hay una tienda real
 * en la que te puedes probar la ropa — que para una boutique de galería es el
 * argumento más fuerte que tiene.
 *
 * Se parte en dos porque el panel de administración es un componente de
 * cliente y no puede renderizar uno asíncrono: allá se usa <BannerTiendaVista>
 * con los datos ya cargados por la página.
 */
export async function BannerTienda() {
  const tienda = await obtenerTienda();
  return <BannerTiendaVista tienda={tienda} />;
}

export function BannerTiendaVista({ tienda }: { tienda: Tienda }) {
  // Sin foto del stand la sección no se muestra: un banner vacío o con una
  // imagen prestada resta más de lo que suma.
  if (!tienda.foto_url) return null;

  return (
    <section className="relative mt-20" aria-label="Nuestra tienda">
      {/* 38rem es la misma altura que las bandas de edición limitada y recién
          llegado, para que las tres piezas anchas de la portada se lean como
          una familia y no como tres tamaños sueltos. */}
      <div className="relative h-[26rem] w-full overflow-hidden md:h-[38rem]">
        <Image
          src={tienda.foto_url}
          alt={`Stand de Bithia Brand en ${tienda.nombre}, ${tienda.ciudad}`}
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Velo suave: el botón tiene que leerse sobre cualquier foto. */}
        <div className="absolute inset-0 bg-carbon/15" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <a
            href={tienda.mapa_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-carbon px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-carbon/85"
          >
            Visítanos
          </a>
          <p className="text-sm font-medium text-white drop-shadow">
            {tienda.nombre} · {tienda.ciudad}
          </p>
        </div>
      </div>
    </section>
  );
}
