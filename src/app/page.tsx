import Link from "next/link";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SeccionDestacados } from "@/components/SeccionDestacados";
import { SeccionCategorias } from "@/components/SeccionCategorias";
import { BandaMarquesina } from "@/components/BandaMarquesina";
import { BannerEdicionLimitada } from "@/components/BannerEdicionLimitada";
import { SeccionTopSemana } from "@/components/SeccionTopSemana";
import { SeccionShopTheLook } from "@/components/SeccionShopTheLook";
import { BannerTienda } from "@/components/BannerTienda";
import { FranjaGarantias } from "@/components/FranjaGarantias";
import { MARQUESINA_SECUNDARIA, MARQUESINA_TERCERA } from "@/lib/contenido";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import {
  listarCategoriasDestacadas,
  obtenerEdicionLimitada,
  obtenerTopSemana,
  obtenerBannerInferior,
  obtenerLookActivo,
  listarDestacados,
  listarNovedades,
} from "@/lib/productos";
import { listarSlidesPublicos } from "@/lib/hero";

// El catálogo cambia cada ~15 días; revalidar cada hora evita golpear Neon en
// cada visita sin que la dueña tenga que esperar un despliegue.
export const revalidate = 3600;

export default async function HomePage() {
  const [slides, novedades, destacados, categorias, edicionLimitada, topSemana, bannerInferior, look] =
    await Promise.all([
    listarSlidesPublicos(),
    listarNovedades(4),
    listarDestacados(8),
    listarCategoriasDestacadas(),
    obtenerEdicionLimitada(),
      obtenerTopSemana(),
      obtenerBannerInferior(),
      obtenerLookActivo(),
    ]);

  return (
    <>
      <Header />
      {/* overflow-x-clip por el carrusel de "Los más pedidos": aunque su pista
          tiene overflow-x-auto y se desplaza sola, el ancho de sus tarjetas
          igual inflaba el scroll horizontal del documento — en celular la
          portada entera se corría al arrastrar el dedo y aparecía una franja
          en blanco. Se recorta acá y no en la sección porque las flechas del
          carrusel cuelgan 20px fuera de ella y quedarían cortadas.
          Es clip y no hidden: no crea contenedor de scroll, así que no rompe
          el position:sticky de nada que viva dentro. */}
      <main className="overflow-x-clip">
        {/* Hero, mosaicos y banda van a sangre completa: el ancho máximo se
            aplica por sección, no al <main>, para que la foto de portada
            llegue a los dos bordes también en desktop. */}
        <Hero slides={slides} />

        <div className="mx-auto max-w-6xl px-4">
          <SeccionDestacados id="destacados" productos={destacados} />
        </div>

        <SeccionCategorias categorias={categorias} />

        <BandaMarquesina />

        <div className="mx-auto max-w-6xl px-4">
        <section id="novedades" className="mt-20 scroll-mt-24">
          {/* Mismo tratamiento que "Los más pedidos": centrado, mayúsculas y
              tracking amplio, para que las dos secciones se lean como pares. */}
          <h2 className="text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl">
            Nuevos ingresos
          </h2>

          {novedades.length === 0 ? (
            <p className="mt-6 rounded-tarjeta bg-white p-6 text-center text-sm text-carbon-suave sombra-tarjeta">
              Todavía no hay prendas publicadas. Vuelve pronto.
            </p>
          ) : (
            // Son exactamente 4 prendas (listarNovedades(4)): 2x2 en celular y
            // una fila de 4 en desktop, sin que quede ninguna huérfana.
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {novedades.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/catalogo"
              className="inline-block rounded-full border border-terracota px-6 py-2.5 text-sm font-semibold text-terracota-oscuro transition hover:bg-terracota hover:text-white"
            >
              Ver catálogo completo
            </Link>
          </div>
        </section>
        </div>

        <BannerEdicionLimitada producto={edicionLimitada} />

        <BandaMarquesina
          mensaje={MARQUESINA_SECUNDARIA}
          tono="terracota"
          className="mt-0"
        />

        <SeccionTopSemana producto={topSemana} />

        <BannerEdicionLimitada
          producto={bannerInferior}
          etiqueta="Recién llegado"
          fondo="bg-crema"
          className="mt-20"
        />

        {/* Pegada a la banda de arriba, igual que la marquesina de edición
            limitada: la banda ancha y su mensaje se leen como una sola pieza. */}
        <BandaMarquesina mensaje={MARQUESINA_TERCERA} className="mt-0" />

        <SeccionShopTheLook look={look} />

        <BannerTienda />

        <FranjaGarantias />

      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
