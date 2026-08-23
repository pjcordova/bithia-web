import type { MetadataRoute } from "next";
import { listarProductosVisibles } from "@/lib/productos";
import { SITIO_URL } from "@/lib/sitio";

// Se regenera con la misma cadencia que el catálogo: si la dueña publica una
// prenda, entra al sitemap dentro de la hora sin necesidad de desplegar.
export const revalidate = 3600;

/**
 * Mapa del sitio para Google. Incluye una entrada por prenda publicada: sin
 * esto, las fichas de producto dependen de que el buscador las descubra
 * navegando, y son justo las páginas que traen visitas nuevas ("vestido
 * terracota Ica" y similares).
 *
 * /admin queda fuera a propósito, igual que en robots.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await listarProductosVisibles();

  const fijas: MetadataRoute.Sitemap = [
    {
      url: SITIO_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITIO_URL}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const fichas: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${SITIO_URL}/producto/${p.id}`,
    lastModified: p.created_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...fijas, ...fichas];
}
