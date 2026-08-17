import Link from "next/link";
import { ArrowRight, Store, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { listarNovedades } from "@/lib/productos";

// El catálogo cambia cada ~15 días; revalidar cada hora evita golpear Neon en
// cada visita sin que la dueña tenga que esperar un despliegue.
export const revalidate = 3600;

export default async function HomePage() {
  const novedades = await listarNovedades(4);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-4">
        <section className="relative mt-4 overflow-hidden rounded-tarjeta bg-rosa-suave/50">
          <div className="max-w-md px-6 py-12 md:px-10 md:py-20">
            <span className="inline-block rounded-md bg-rosa-suave px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-terracota-oscuro">
              Nueva colección
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-carbon md:text-5xl">
              Renueva tu estilo con Bithia
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-carbon-suave md:text-base">
              Descubre prendas exclusivas diseñadas para realzar tu belleza
              natural. Moda boutique con la calidez de Ica.
            </p>
            <Link
              href="/catalogo"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-terracota px-6 py-3 text-sm font-semibold text-white transition hover:bg-terracota-oscuro"
            >
              Ver catálogo
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-carbon">
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
