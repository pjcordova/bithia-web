import Link from "next/link";
import { Store, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { SeccionDestacados } from "@/components/SeccionDestacados";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { listarDestacados, listarNovedades } from "@/lib/productos";

// El catálogo cambia cada ~15 días; revalidar cada hora evita golpear Neon en
// cada visita sin que la dueña tenga que esperar un despliegue.
export const revalidate = 3600;

export default async function HomePage() {
  const [novedades, destacados] = await Promise.all([
    listarNovedades(4),
    listarDestacados(8),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-4">
        <Hero />

        <SeccionDestacados id="destacados" productos={destacados} />

        <section id="novedades" className="mt-20 scroll-mt-24">
          <h2 className="text-xl font-semibold uppercase tracking-[0.1em] text-carbon">
            Nuevas esta semana
          </h2>
          <p className="mt-1 text-sm text-carbon-suave">
            Selección exclusiva para{" "}
            <Link href="/catalogo" className="text-terracota underline">
              ti
            </Link>
          </p>

          {novedades.length === 0 ? (
            <p className="mt-6 rounded-tarjeta bg-white p-6 text-center text-sm text-carbon-suave sombra-tarjeta">
              Todavía no hay prendas publicadas. Vuelve pronto.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
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
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
