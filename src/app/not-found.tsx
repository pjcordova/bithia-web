import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-terracota-oscuro">
          No encontramos esta página
        </h1>
        <p className="mt-2 text-sm text-carbon-suave">
          Puede que la prenda ya no esté disponible o el enlace haya cambiado.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-lg bg-terracota px-6 py-3 text-sm font-semibold text-white transition hover:bg-terracota-oscuro"
        >
          Ver catálogo
        </Link>
      </main>
      <Footer />
    </>
  );
}
