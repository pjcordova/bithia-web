import type { MetadataRoute } from "next";
import { SITIO_URL } from "@/lib/sitio";

/**
 * El catálogo se quiere indexado; el panel de la dueña no. Bloquear /admin
 * acá no es una medida de seguridad —de eso ya se encarga el middleware— sino
 * de higiene: evita que el login aparezca en resultados de búsqueda.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITIO_URL}/sitemap.xml`,
  };
}
