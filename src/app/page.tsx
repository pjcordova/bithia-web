import Link from "next/link";
import { Store, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SeccionDestacados } from "@/components/SeccionDestacados";
import { SeccionCategorias } from "@/components/SeccionCategorias";
import { BandaMarquesina } from "@/components/BandaMarquesina";
import { BannerEdicionLimitada } from "@/components/BannerEdicionLimitada";
import { SeccionTopSemana } from "@/components/SeccionTopSemana";
import { MARQUESINA_SECUNDARIA } from "@/lib/contenido";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import {
  listarCategoriasDestacadas,
  obtenerEdicionLimitada,
  obtenerTopSemana,
  obtenerBannerInferior,
  listarDestacados,
  listarNovedades,
} from "@/lib/productos";

// El catálogo cambia cada ~15 días; revalidar cada hora evita golpear Neon en
// cada visita sin que la dueña tenga que esperar un despliegue.
export const revalidate = 3600;

export default async function HomePage() {
  const [novedades, destacados, categorias, edicionLimitada, topSemana, bannerInferior] =
    await Promise.all([
    listarNovedades(4),
    listarDestacados(8),
    listarCategoriasDestacadas(),
    obtenerEdicionLimitada(),
      obtenerTopSemana(),
      obtenerBannerInferior(),
    ]);

  return (
    <>
      <Header />
      <main className="pb-4">
        {/* Hero, mosaicos y banda van a sangre completa: el ancho máximo se
            aplica por sección, no al <main>, para que la foto de portada
            llegue a los dos bordes también en desktop. */}
        <Hero />

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

        <div className="mx-auto max-w-6xl px-4">
        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="rounded-tarjeta bg-rosa-suave/40 p-8">
            <Truck className="text-terracota-oscuro" size={28} aria-hidden />
            <h2 className="mt-4 text-lg font-extrabold text-carbon">
              Nueva mercadería cada 15 días
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-carbon-suave">
              Mantenemos nuestro catálogo fresco y actualizado para que siempre
              encuentres la última tendencia en Ica.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-tarjeta bg-terracota p-8 text-center text-white">
            <Store size={28} aria-hidden />
            <h2 className="mt-4 text-lg font-extrabold">Visítanos</h2>
            <p className="mt-2 text-sm opacity-90">
              Galería Polvos Rosados
              <br />
              Ica, Perú
            </p>
          </div>
        </section>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
