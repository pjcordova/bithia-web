/**
 * Contenido editable del sitio: barra de anuncios y slides del hero.
 * Vive aparte de los componentes para que cambiar un mensaje o una foto no
 * obligue a tocar código de layout.
 */

/**
 * Barra superior. Rota entre mensajes cada pocos segundos.
 *
 * IMPORTANTE: cada frase es una promesa que la clienta lee antes que nada.
 * No poner "envíos gratis" ni plazos de entrega mientras el delivery se
 * coordine caso por caso — prometer de más aquí se paga en el chat de WhatsApp.
 */
export const ANUNCIOS = [
  "Mercadería nueva cada 15 días",
  "Recojo en tienda · Galería Polvos Rosados, Ica",
  "Coordinamos tu delivery por WhatsApp",
] as const;

/** Mensaje de la banda que desfila bajo las categorías. */
export const MARQUESINA = "Mercadería nueva cada 15 días";

/**
 * Segunda banda, sobre "Top de la semana". Habla de la prenda destacada, no de
 * descuentos: Bithia no maneja campañas de rebaja como las tiendas grandes, y
 * anunciar una que no existe se nota al primer clic.
 */
export const MARQUESINA_SECUNDARIA = "Pocas unidades por modelo";

export type Slide = {
  /** Foto de fondo. Sin imagen se usa el degradado cálido de marca. */
  imagen?: string;
  /** Texto corto en superíndice sobre el titular. */
  etiqueta?: string;
  titulo: string;
  subtitulo?: string;
  cta: { texto: string; href: string };
  /** Oscurece la foto para que el texto sea legible. 0 = sin velo. */
  velo?: number;
};

/**
 * Slides del hero. Hoy funcionan sin foto (degradado de marca).
 *
 * TODO: reemplazar por fotos verticales reales de campaña. Formato 4:5 o 3:4,
 * mínimo 1200px de ancho, con la modelo descentrada hacia la derecha para que
 * el texto de la izquierda no le tape la cara en desktop.
 */
export const SLIDES: Slide[] = [
  {
    etiqueta: "Nueva colección",
    titulo: "Renueva tu estilo con Bithia",
    subtitulo:
      "Prendas exclusivas diseñadas para realzar tu belleza natural, con la calidez de Ica.",
    cta: { texto: "Ver catálogo", href: "/catalogo" },
  },
  {
    etiqueta: "Recién llegado",
    titulo: "Lo nuevo de esta quincena",
    subtitulo:
      "Renovamos el stand cada 15 días. Lo que ves hoy puede no estar en la próxima visita.",
    cta: { texto: "Ver novedades", href: "/catalogo" },
  },
  {
    etiqueta: "Visítanos",
    titulo: "Pruébate en el stand",
    subtitulo:
      "Estamos en la Galería Polvos Rosados, Ica. Coordina tu visita por WhatsApp.",
    cta: { texto: "Cómo llegar", href: "/catalogo" },
  },
];

/** Cada cuántos milisegundos avanza el carrusel. */
export const HERO_INTERVALO_MS = 6000;
