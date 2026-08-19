import { prisma } from "@/lib/prisma";
import { leerSeguro } from "@/lib/productos";

export type HeroSlide = {
  id: string;
  orden: number;
  imagen_url: string | null;
  etiqueta: string | null;
  titulo: string;
  subtitulo: string | null;
  cta_texto: string;
  cta_href: string;
  velo: number;
  activo: boolean;
};

type FilaSlide = {
  id: string;
  orden: number;
  imagen_url: string | null;
  etiqueta: string | null;
  titulo: string;
  subtitulo: string | null;
  cta_texto: string;
  cta_href: string;
  velo: { toNumber(): number };
  activo: boolean;
};

function serializar(s: FilaSlide): HeroSlide {
  return { ...s, velo: s.velo.toNumber() };
}

/** Carrusel grande de portada, tal como lo ve la clienta. */
export async function listarSlidesPublicos(): Promise<HeroSlide[]> {
  return leerSeguro(
    "listarSlidesPublicos",
    async () => {
      const filas = await prisma.hero_slides.findMany({
        where: { activo: true },
        orderBy: { orden: "asc" },
      });
      return filas.map(serializar);
    },
    []
  );
}

/** Todas las diapositivas, activas o no: el panel necesita verlas para poder reactivarlas. */
export async function listarSlidesAdmin(): Promise<HeroSlide[]> {
  const filas = await prisma.hero_slides.findMany({
    orderBy: { orden: "asc" },
  });
  return filas.map(serializar);
}
