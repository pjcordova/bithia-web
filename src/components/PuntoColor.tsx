import { esColorClaro, resolverColor } from "@/lib/colores";

/**
 * Punto de color de la prenda.
 *
 * Si no se puede resolver un color confiable se muestra el nombre escrito:
 * mejor la palabra que un círculo de un color equivocado.
 *
 * El nombre siempre viaja en `title` y en texto para lector de pantalla — un
 * punto a secas no comunica nada a quien no ve o no distingue colores.
 */
export function PuntoColor({
  nombre,
  hex,
  conNombre = false,
  tamano = "sm",
}: {
  nombre: string;
  hex: string | null;
  /** En la ficha se muestra el nombre al lado; en la tarjeta solo el punto. */
  conNombre?: boolean;
  tamano?: "sm" | "md";
}) {
  const color = resolverColor(nombre, hex);
  const medida = tamano === "md" ? "h-5 w-5" : "h-3.5 w-3.5";

  if (!color) {
    return <span className="text-[11px] text-carbon-suave">{nombre}</span>;
  }

  return (
    <span
      className="inline-flex items-center gap-2"
      title={conNombre ? undefined : nombre}
    >
      <span
        aria-hidden
        className={`inline-block shrink-0 rounded-full ${medida} ${
          esColorClaro(color) ? "ring-1 ring-linea" : ""
        }`}
        style={{ backgroundColor: color }}
      />
      {conNombre ? (
        <span className="text-sm text-carbon">{nombre}</span>
      ) : (
        <span className="sr-only">Color: {nombre}</span>
      )}
    </span>
  );
}
