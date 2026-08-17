"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { NOMBRES_CATEGORIA, TALLAS } from "@/lib/categorias";
import { esCodigoLoteValido, generarCodigoLote } from "@/lib/codigo-lote";

export type ProductoState = { error?: string; ok?: boolean };

/**
 * El middleware ya bloquea /admin, pero las Server Actions se invocan por POST
 * directo y no pasan por él. Cada acción revalida la sesión por su cuenta.
 */
async function exigirSesion(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sesion = await verifySessionToken(token);
  if (!sesion) throw new Error("No autorizado.");
}

function refrescarVistas(id?: string) {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin");
  if (id) revalidatePath(`/producto/${id}`);
}

type CamposProducto = {
  nombre: string;
  categoria: string;
  color_principal: string;
  color_hex: string | null;
  descripcion: string | null;
  precio_venta: number;
  imagen_url: string | null;
  visible_en_tienda: boolean;
  disponible: boolean;
  destacado: boolean;
  tallas: string[];
  codigoLoteManual: string;
};

function leerCampos(formData: FormData): CamposProducto | string {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const color = String(formData.get("color_principal") ?? "").trim();
  const hexCrudo = String(formData.get("color_hex") ?? "").trim();
  const hex = /^#[0-9a-fA-F]{6}$/.test(hexCrudo) ? hexCrudo.toLowerCase() : null;
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const precioCrudo = String(formData.get("precio_venta") ?? "").replace(",", ".");
  const imagen = String(formData.get("imagen_url") ?? "").trim();
  const codigoLoteManual = String(formData.get("codigo_lote") ?? "")
    .trim()
    .toUpperCase();

  if (!nombre) return "Escribe el nombre de la prenda.";
  if (!NOMBRES_CATEGORIA.includes(categoria)) return "Elige una categoría válida.";
  if (!color) return "Escribe el color principal.";

  const precio = Number.parseFloat(precioCrudo);
  if (!Number.isFinite(precio) || precio <= 0) {
    return "El precio debe ser un número mayor que cero.";
  }

  const tallas = TALLAS.filter((t) => formData.get(`talla_${t}`) === "on");
  if (tallas.length === 0) return "Marca al menos una talla.";

  if (codigoLoteManual && !esCodigoLoteValido(codigoLoteManual)) {
    return "El código de lote debe tener el formato VES-2508-03.";
  }

  if (imagen && !imagen.startsWith("https://res.cloudinary.com/")) {
    return "La foto no se subió correctamente. Intenta de nuevo.";
  }

  return {
    nombre,
    categoria,
    color_principal: color,
    color_hex: hex,
    descripcion: descripcion || null,
    // Se redondea a céntimos: Prisma rechaza más de 2 decimales en Decimal(10,2).
    precio_venta: Math.round(precio * 100) / 100,
    imagen_url: imagen || null,
    visible_en_tienda: formData.get("visible_en_tienda") === "on",
    disponible: formData.get("disponible") === "on",
    destacado: formData.get("destacado") === "on",
    tallas,
    codigoLoteManual,
  };
}

export async function crearProducto(
  _prev: ProductoState,
  formData: FormData
): Promise<ProductoState> {
  await exigirSesion();

  const campos = leerCampos(formData);
  if (typeof campos === "string") return { error: campos };

  const { tallas, codigoLoteManual, ...datos } = campos;
  const codigo_lote = codigoLoteManual || (await generarCodigoLote(datos.categoria));

  try {
    await prisma.productos.create({
      data: {
        ...datos,
        codigo_lote,
        tallas: { create: tallas.map((talla) => ({ talla })) },
      },
    });
  } catch (e) {
    if (esCodigoDuplicado(e)) {
      return { error: `El código de lote ${codigo_lote} ya existe.` };
    }
    throw e;
  }

  refrescarVistas();
  return { ok: true };
}

export async function actualizarProducto(
  _prev: ProductoState,
  formData: FormData
): Promise<ProductoState> {
  await exigirSesion();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador de la prenda." };

  const campos = leerCampos(formData);
  if (typeof campos === "string") return { error: campos };

  const { tallas, codigoLoteManual, ...datos } = campos;

  try {
    // Las tallas se reemplazan completas: es más simple y más seguro que
    // calcular altas y bajas por separado.
    await prisma.$transaction([
      prisma.tallas.deleteMany({ where: { producto_id: id } }),
      prisma.productos.update({
        where: { id },
        data: {
          ...datos,
          ...(codigoLoteManual ? { codigo_lote: codigoLoteManual } : {}),
          tallas: { create: tallas.map((talla) => ({ talla })) },
        },
      }),
    ]);
  } catch (e) {
    if (esCodigoDuplicado(e)) {
      return { error: `El código de lote ${codigoLoteManual} ya existe.` };
    }
    throw e;
  }

  refrescarVistas(id);
  return { ok: true };
}

export async function eliminarProducto(formData: FormData): Promise<void> {
  await exigirSesion();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Las tallas caen solas por el onDelete: Cascade del schema.
  await prisma.productos.delete({ where: { id } });
  refrescarVistas(id);
}

function esCodigoDuplicado(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: unknown }).code === "P2002"
  );
}
