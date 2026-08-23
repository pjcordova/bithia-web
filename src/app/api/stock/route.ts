import { NextRequest, NextResponse } from "next/server";
import { consultarStockErp, type StockPorTalla } from "@/lib/erp";
import { esCodigoLoteValido } from "@/lib/codigo-lote";

// El stock cambia con cada venta; nunca debe servirse una respuesta cacheada
// por Next. El cache corto de más abajo es otra cosa: propio de este archivo
// y de segundos, para no repetirle la misma pregunta al ERP.
export const dynamic = "force-dynamic";

/** Un carrito real no se acerca a esto; corta peticiones infladas a mano. */
const MAX_CODIGOS = 20;

/** Tope por IP. Suficiente para navegar de verdad, no para un bucle. */
const MAX_POR_MINUTO = 40;
const VENTANA_MS = 60_000;

/**
 * Cuánto se reusa la respuesta del ERP para un mismo código. Si varias
 * clientas miran la misma prenda a la vez, el ERP recibe una sola pregunta
 * en lugar de una por visitante. Tres segundos es poco para que el dato se
 * vea viejo y mucho para absorber un pico.
 */
const CACHE_MS = 3_000;

// Estado en memoria del proceso. En Vercel cada instancia tiene el suyo y se
// pierde al reciclarse, así que esto acota el abuso, no lo elimina: si algún
// día hace falta una garantía dura, el siguiente paso es exigir sesión de
// clienta (ver el login pendiente) o un contador compartido tipo Redis.
const golpesPorIp = new Map<string, number[]>();
const cache = new Map<string, { hasta: number; filas: StockPorTalla[] }>();

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (golpesPorIp.get(ip) ?? []).filter(
    (t) => ahora - t < VENTANA_MS
  );
  recientes.push(ahora);
  golpesPorIp.set(ip, recientes);

  // Limpieza barata para que el mapa no crezca sin techo con IPs de paso.
  if (golpesPorIp.size > 5_000) {
    for (const [otraIp, marcas] of golpesPorIp) {
      if (marcas.every((t) => ahora - t >= VENTANA_MS)) golpesPorIp.delete(otraIp);
    }
  }

  return recientes.length > MAX_POR_MINUTO;
}

/**
 * Puente entre el navegador de la clienta y el ERP: el navegador nunca
 * puede llamar al ERP directo (necesitaría la API key ahí, expuesta). Este
 * endpoint corre en el servidor de bithia-web, que sí la tiene.
 *
 * Es público —cualquiera en internet puede llamarlo— y cada llamada suya se
 * traduce en una petición saliente al ERP, así que acá se filtra lo que se
 * le deja preguntar: tope por IP, tope de códigos por pedido, formato válido
 * y cache corto. Sin esto, un bucle desde afuera tumbaría el ERP.
 *
 * Body: { "codigos": ["TOP-2508-03"] }
 * Respuesta: { "ok": boolean, "stock": { "...codigo...": [{talla,cantidad}] } }
 * Nunca falla de forma visible: si el ERP no responde, ok sale false y la
 * interfaz cae al toggle manual disponible/agotado.
 */
export async function POST(request: NextRequest) {
  // x-real-ip lo pone la plataforma (Vercel) y el navegador no puede
  // falsearlo; x-forwarded-for queda de respaldo para otros despliegues, pero
  // su primer valor sí puede venir del cliente. O sea: esto encarece el abuso,
  // no lo vuelve imposible. El día que haga falta una garantía dura, el
  // camino es exigir sesión de clienta para consultar stock.
  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local";
  if (excedeLimite(ip)) {
    return NextResponse.json(
      { error: "Demasiadas consultas seguidas." },
      { status: 429 }
    );
  }

  let body: { codigos?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Solo códigos con el formato que genera esta misma web (VES-2508-03): así
  // el ERP nunca recibe texto arbitrario venido de afuera.
  const codigos = Array.isArray(body.codigos)
    ? [
        ...new Set(
          body.codigos.filter(
            (c): c is string => typeof c === "string" && esCodigoLoteValido(c)
          )
        ),
      ].slice(0, MAX_CODIGOS)
    : [];

  if (codigos.length === 0) return NextResponse.json({ ok: false, stock: {} });

  const ahora = Date.now();
  const stock: Record<string, StockPorTalla[]> = {};
  const faltantes: string[] = [];
  for (const codigo of codigos) {
    const guardado = cache.get(codigo);
    if (guardado && guardado.hasta > ahora) stock[codigo] = guardado.filas;
    else faltantes.push(codigo);
  }

  if (faltantes.length === 0) return NextResponse.json({ ok: true, stock });

  const resultado = await consultarStockErp(faltantes);
  // Si el ERP falla se descarta todo, incluso lo que sí estaba en cache: con
  // ok=true el cliente toma un código sin filas como agotado, así que una
  // respuesta a medias marcaría prendas como agotadas sin serlo. Mejor ok=false
  // y que caiga al toggle manual.
  if (!resultado.ok) return NextResponse.json({ ok: false, stock: {} });

  for (const codigo of faltantes) {
    const filas = resultado.stock[codigo] ?? [];
    stock[codigo] = filas;
    cache.set(codigo, { hasta: ahora + CACHE_MS, filas });
  }

  return NextResponse.json({ ok: true, stock });
}
