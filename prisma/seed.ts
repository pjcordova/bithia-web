/**
 * Datos de ejemplo para desarrollo:  npm run db:seed
 *
 * Las fotos son marcadores de posición; la dueña sube las reales desde el
 * panel. Ejecutarlo dos veces no duplica nada (upsert por codigo_lote).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRENDAS = [
  {
    codigo_lote: "VES-2508-01",
    nombre: "Vestido Terracotta Midi",
    categoria: "Vestidos",
    color_principal: "Terracotta",
    descripcion:
      "Vestido midi de lino con caída suave, ideal para el día a día y para una salida de tarde.",
    precio_venta: 145.0,
    disponible: true,
    tallas: ["S", "M", "L"],
  },
  {
    codigo_lote: "BLU-2508-01",
    nombre: "Blusa Seda Blanca",
    categoria: "Blusas",
    color_principal: "Blanco",
    descripcion: "Blusa de seda con mangas amplias y puño ajustado.",
    precio_venta: 89.0,
    disponible: true,
    tallas: ["S", "M"],
  },
  {
    codigo_lote: "PAN-2508-01",
    nombre: "Pantalón Sastre Crema",
    categoria: "Pantalones",
    color_principal: "Crema",
    descripcion: "Pantalón de corte recto, tiro alto, con pinzas al frente.",
    precio_venta: 120.0,
    disponible: false,
    tallas: ["M", "L"],
  },
  {
    codigo_lote: "BLA-2508-01",
    nombre: "Blazer Estructurado Negro",
    categoria: "Blazers",
    color_principal: "Negro",
    descripcion: "Blazer de corte estructurado con forro interior.",
    precio_venta: 195.0,
    disponible: true,
    tallas: ["S", "M", "L"],
  },
];

async function main() {
  for (const { tallas, ...datos } of PRENDAS) {
    const producto = await prisma.productos.upsert({
      where: { codigo_lote: datos.codigo_lote },
      update: datos,
      create: datos,
    });

    await prisma.tallas.deleteMany({ where: { producto_id: producto.id } });
    await prisma.tallas.createMany({
      data: tallas.map((talla) => ({ producto_id: producto.id, talla })),
    });

    console.log(`✓ ${datos.codigo_lote} — ${datos.nombre}`);
  }
}

main()
  .then(() => console.log(`\n${PRENDAS.length} prendas listas.`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
