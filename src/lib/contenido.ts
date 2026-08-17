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

/**
 * Tercera banda, entre la prenda recién llegada y "Chic Style". Enlaza las dos
 * secciones: la de arriba muestra una prenda suelta y la de abajo el conjunto
 * armado, así que el mensaje habla justamente de combinar.
 */
export const MARQUESINA_TERCERA = "Armamos tu look contigo por WhatsApp";

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

// ---------------------------------------------------------------------------
// Tienda física
// ---------------------------------------------------------------------------

export const TIENDA = {
  nombre: "Galería Polvos Rosados",
  ciudad: "Ica, Perú",
  /** TODO: reemplazar por una foto real del stand de Bithia. */
  foto: "https://res.cloudinary.com/rrh7xuqq/image/upload/sample.jpg",
  /** Búsqueda en Maps, no un punto inventado: la dirección exacta la fija la dueña. */
  mapa: "https://www.google.com/maps/search/?api=1&query=Galer%C3%ADa+Polvos+Rosados+Ica+Per%C3%BA",
};

// ---------------------------------------------------------------------------
// Franja de garantías
// ---------------------------------------------------------------------------

/**
 * Cada punto es una promesa que la clienta puede reclamar después.
 *
 * La referencia anuncia envíos gratis, pagos con Mercado Pago y cuotas sin
 * intereses. Nada de eso aplica a Bithia: no hay pasarela de pago ni política
 * de envío gratis, la entrega se coordina caso por caso. Aquí van solo cosas
 * que el negocio sí cumple hoy.
 */
export const GARANTIAS = [
  {
    icono: "tienda" as const,
    titulo: "Recojo en tienda",
    detalle: "En nuestro stand de Galería Polvos Rosados, Ica.",
  },
  {
    icono: "envio" as const,
    titulo: "Delivery coordinado",
    detalle: "Acordamos entrega y costo contigo por WhatsApp.",
  },
  {
    icono: "renovacion" as const,
    titulo: "Mercadería nueva",
    detalle: "Renovamos el catálogo cada 15 días.",
  },
  {
    icono: "asesoria" as const,
    titulo: "Atención personalizada",
    detalle: "Te asesoramos con tallas y medidas antes de comprar.",
  },
];

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export const INSTAGRAM_URL = "https://instagram.com/bithia_brand";

/**
 * Enlaces legales del pie. Se muestran solo los que tienen destino: un enlace
 * a una política que no existe es peor que no tenerla.
 *
 * TODO pendientes antes de publicar:
 *  - Términos y condiciones.
 *  - Política de cambios y devoluciones.
 *  - Libro de Reclamaciones: en Perú, los negocios que venden a consumidores
 *    finales suelen estar obligados a ofrecerlo (Indecopi). Conviene que la
 *    dueña lo confirme y enlace aquí el formulario que corresponda.
 */
export const ENLACES_LEGALES: { texto: string; href: string }[] = [];
