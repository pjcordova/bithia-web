/**
 * Migración única: pasa las diapositivas que vivían fijas en
 * lib/contenido.ts a la tabla hero_slides, para que el sitio público se vea
 * exactamente igual una vez que Hero.tsx empiece a leer de la base.
 * Ejecutar UNA vez:  npx tsx scripts/migrar-hero-slides.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLOUD = "https://res.cloudinary.com/rrh7xuqq/image/upload";

const SLIDES = [
  {
    orden: 0,
    imagen_url: `${CLOUD}/samples/outdoor-woman.jpg`,
    velo: 0.35,
    etiqueta: "Nueva colección",
    titulo: "Renueva tu estilo con Bithia",
    subtitulo:
      "Prendas exclusivas diseñadas para realzar tu belleza natural, con la calidez de Ica.",
    cta_texto: "Ver catálogo",
    cta_href: "/catalogo",
  },
  {
    orden: 1,
    imagen_url: `${CLOUD}/samples/look-up.jpg`,
    velo: 0.4,
    etiqueta: "Recién llegado",
    titulo: "Lo nuevo de esta quincena",
    subtitulo:
      "Renovamos el stand cada 15 días. Lo que ves hoy puede no estar en la próxima visita.",
    cta_texto: "Ver novedades",
    cta_href: "/catalogo",
  },
  {
    orden: 2,
    imagen_url: `${CLOUD}/samples/two-ladies.jpg`,
    velo: 0.4,
    etiqueta: "Visítanos",
    titulo: "Pruébate en el stand",
    subtitulo:
      "Estamos en la Galería Polvos Rosados, Ica. Coordina tu visita por WhatsApp.",
    cta_texto: "Cómo llegar",
    cta_href: "/catalogo",
  },
];

async function main() {
  const existentes = await prisma.hero_slides.count();
  if (existentes > 0) {
    console.log(`Ya hay ${existentes} diapositivas en la base. No se migra nada.`);
    return;
  }
  await prisma.hero_slides.createMany({ data: SLIDES });
  console.log(`Migradas ${SLIDES.length} diapositivas.`);
}

main().finally(() => prisma.$disconnect());
