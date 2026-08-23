/**
 * URL pública del sitio, para armar enlaces absolutos: los necesitan el
 * sitemap, el robots.txt y las imágenes de Open Graph (WhatsApp e Instagram
 * exigen URL completa, no rutas relativas).
 *
 * Se resuelve en este orden:
 *   1. NEXT_PUBLIC_SITE_URL — ponerla el día que se compre el dominio propio.
 *   2. La URL de producción que Vercel inyecta sola en cada despliegue.
 *   3. localhost, para desarrollo.
 *
 * Así el sitemap y las vistas previas apuntan al sitio correcto sin tocar
 * código cuando cambie el dominio.
 */
function resolver(): string {
  const propia = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (propia) return propia.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITIO_URL = resolver();
