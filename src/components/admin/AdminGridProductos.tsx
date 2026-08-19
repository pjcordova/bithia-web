import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { SeccionVacia } from "@/components/admin/AdminSeccionDestacados";
import type { ProductoAdmin } from "@/components/admin/ProductForm";

/**
 * Grilla de tarjetas editables. Se reusa para "Nuevos ingresos" (calco del
 * grid-cols-2 de la portada) y para el listado completo del inventario al
 * final de la página, que garantiza que toda prenda sea alcanzable aunque no
 * esté marcada para ninguna sección destacada de la portada.
 */
export function AdminGridProductos({
  titulo,
  productos,
  columnas = "grid-cols-2",
  onEditar,
  vacioTexto,
}: {
  titulo: string;
  productos: ProductoAdmin[];
  columnas?: string;
  onEditar: (producto: ProductoAdmin) => void;
  vacioTexto: string;
}) {
  if (productos.length === 0) {
    return <SeccionVacia titulo={titulo}>{vacioTexto}</SeccionVacia>;
  }

  return (
    <section className="mt-16 scroll-mt-24">
      <h2 className="text-center text-xl font-semibold uppercase tracking-[0.25em] text-carbon md:text-2xl">
        {titulo}
      </h2>
      <div className={`mt-8 grid gap-4 ${columnas}`}>
        {productos.map((p) => (
          <AdminProductCard key={p.id} producto={p} onEditar={onEditar} />
        ))}
      </div>
    </section>
  );
}
