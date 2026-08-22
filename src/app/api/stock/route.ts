import { NextRequest, NextResponse } from "next/server";
import { consultarStockErp } from "@/lib/erp";

/**
 * Puente entre el navegador de la clienta y el ERP: el navegador nunca
 * puede llamar al ERP directo (necesitaría la API key ahí, expuesta). Este
 * endpoint corre en el servidor de bithia-web, que sí la tiene.
 *
 * Body: { "codigos": ["TOP-2508-03-ROJO"] }
 * Respuesta: { "ok": boolean, "stock": { "...codigo...": [{talla,cantidad}] } }
 * Nunca falla de forma visible: si el ERP no responde, ok sale false y la
 * interfaz cae al toggle manual disponible/agotado.
 */
export async function POST(request: NextRequest) {
  let body: { codigos?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const codigos = Array.isArray(body.codigos)
    ? body.codigos.filter((c): c is string => typeof c === "string" && c.length > 0)
    : [];

  const resultado = await consultarStockErp(codigos);
  return NextResponse.json(resultado);
}
