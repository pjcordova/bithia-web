import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarritoVista } from "@/components/CarritoVista";

export const metadata: Metadata = {
  title: "Mi carrito",
  robots: { index: false },
};

export default function CarritoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-4">
        <CarritoVista />
      </main>
      <Footer />
    </>
  );
}
