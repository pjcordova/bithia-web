/**
 * Datos de ejemplo para desarrollo:  npm run db:seed
 *
 * Las fotos son marcadores de posición; la dueña sube las reales desde el
 * panel. Ejecutarlo dos veces no duplica nada (upsert por codigo_lote).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Imagen de relleno para poder ver la maqueta. NO son fotos de Bithia.
const MUESTRA = "https://res.cloudinary.com/rrh7xuqq/image/upload/sample.jpg";

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
    destacado: true,
    edicion_limitada: true,
    tallas: ["S", "M", "L"],
  },
  {
    codigo_lote: "VES-2508-02",
    nombre: "Vestido Floral Pastel",
    categoria: "Vestidos",
    color_principal: "Rosa pastel",
    descripcion: "Vestido largo con estampado floral y mangas abullonadas.",
    precio_venta: 95.0,
    disponible: true,
    destacado: true,
    edicion_limitada: false,
    tallas: ["S", "M"],
  },
  {
    codigo_lote: "BLU-2508-01",
    nombre: "Blusa Seda Blanca",
    categoria: "Blusas",
    color_principal: "Blanco",
    descripcion: "Blusa de seda con mangas amplias y puño ajustado.",
    precio_venta: 89.0,
    disponible: true,
    destacado: true,
    edicion_limitada: false,
    tallas: ["S", "M"],
  },
  {
    codigo_lote: "BLU-2508-02",
    nombre: "Blusa Lino Terracota",
    categoria: "Blusas",
    color_principal: "Terracota",
    descripcion: "Blusa de lino con botones de nácar y corte holgado.",
    precio_venta: 85.0,
    disponible: true,
    destacado: true,
    edicion_limitada: false,
    tallas: ["S", "M", "L"],
  },
  {
    codigo_lote: "PAN-2508-01",
    nombre: "Pantalón Sastre Crema",
    categoria: "Pantalones",
    color_principal: "Crema",
    descripcion: "Pantalón de corte recto, tiro alto, con pinzas al frente.",
    precio_venta: 120.0,
    disponible: false,
    destacado: false,
    edicion_limitada: false,
    tallas: ["M", "L"],
  },
  {
    codigo_lote: "PAN-2508-02",
    nombre: "Pantalón Palazzo Camel",
    categoria: "Pantalones",
    color_principal: "Camel",
    descripcion: "Palazzo de tiro alto con caída fluida y pretina elástica.",
    precio_venta: 125.0,
    disponible: true,
    destacado: true,
    edicion_limitada: false,
    tallas: ["S", "M", "L"],
  },
  {
    codigo_lote: "BLA-2508-01",
    nombre: "Blazer Estructurado Negro",
    categoria: "Blazers",
    color_principal: "Negro",
    descripcion: "Blazer de corte estructurado con forro interior.",
    precio_venta: 195.0,
    disponible: true,
    destacado: true,
    edicion_limitada: false,
    tallas: ["S", "M", "L"],
  },
  {
    codigo_lote: "BLA-2508-02",
    nombre: "Blazer Lino Beige",
    categoria: "Blazers",
    color_principal: "Beige",
    descripcion: "Blazer liviano de lino, ideal para el verano iqueño.",
    precio_venta: 175.0,
    disponible: true,
    destacado: false,
    edicion_limitada: false,
    tallas: ["M", "L"],
  },
  {
    codigo_lote: "FAL-2508-01",
    nombre: "Falda Midi Satinada Chocolate",
    categoria: "Faldas",
    color_principal: "Chocolate",
    descripcion: "Falda midi satinada con caída al bies.",
    precio_venta: 110.0,
    disponible: true,
    destacado: true,
    edicion_limitada: false,
    tallas: ["S", "M", "L"],
  },
  {
    codigo_lote: "FAL-2508-02",
    nombre: "Falda Plisada Crema",
    categoria: "Faldas",
    color_principal: "Crema",
    descripcion: "Falda plisada con pretina ancha.",
    precio_venta: 99.0,
    disponible: true,
    destacado: false,
    edicion_limitada: false,
    tallas: ["S", "M"],
  },
  {
    codigo_lote: "TOP-2508-01",
    nombre: "Top Halter Negro",
    categoria: "Tops",
    color_principal: "Negro",
    descripcion: "Top halter de punto con espalda descubierta.",
    precio_venta: 69.0,
    disponible: true,
    destacado: true,
    edicion_limitada: false,
    tallas: ["S", "M"],
  },
  {
    codigo_lote: "TOP-2508-02",
    nombre: "Top Seda Rosa",
    categoria: "Tops",
    color_principal: "Rosa palo",
    descripcion: "Top de seda con tirantes regulables.",
    precio_venta: 65.0,
    disponible: true,
    destacado: false,
    edicion_limitada: false,
    tallas: ["S", "M", "L"],
  },
];

async function main() {
  for (const { tallas, ...datos } of PRENDAS) {
    const producto = await prisma.productos.upsert({
      where: { codigo_lote: datos.codigo_lote },
      update: { ...datos, imagen_url: MUESTRA },
      create: { ...datos, imagen_url: MUESTRA },
    });

    await prisma.tallas.deleteMany({ where: { producto_id: producto.id } });
    await prisma.tallas.createMany({
      data: tallas.map((talla) => ({ producto_id: producto.id, talla })),
    });

    console.log(`✓ ${datos.codigo_lote} — ${datos.nombre}`);
  }
}

main()
  .then(() =>
    console.log(
      `\n${PRENDAS.length} prendas listas (${PRENDAS.filter((p) => p.destacado).length} marcadas como más pedidas).`
    )
  )
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
