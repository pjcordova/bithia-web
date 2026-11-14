"use client";

import { useMemo, useState } from "react";
import { LogOut, Pencil, Plus } from "lucide-react";
import { ProductForm, type ProductoAdmin } from "@/components/admin/ProductForm";
import { AdminSeccionDestacados } from "@/components/admin/AdminSeccionDestacados";
import { AdminSeccionCategorias } from "@/components/admin/AdminSeccionCategorias";
import { AdminGridProductos } from "@/components/admin/AdminGridProductos";
import { AdminBannerEdicionLimitada } from "@/components/admin/AdminBannerEdicionLimitada";
import { AdminSeccionTopSemana } from "@/components/admin/AdminSeccionTopSemana";
import {
  AdminSeccionShopTheLook,
  type AdminLook,
} from "@/components/admin/AdminSeccionShopTheLook";
import { AdminHero } from "@/components/admin/AdminHero";
import { SlideForm } from "@/components/admin/SlideForm";
import { LookForm } from "@/components/admin/LookForm";
import { TiendaForm } from "@/components/admin/TiendaForm";
import { AdminPrendas } from "@/components/admin/AdminPrendas";
import { AdminPortada } from "@/components/admin/AdminPortada";
import { calcularUbicaciones } from "@/lib/ubicaciones";
import { BandaMarquesina } from "@/components/BandaMarquesina";
import { BannerTiendaVista } from "@/components/BannerTienda";
import { FranjaGarantias } from "@/components/FranjaGarantias";
import { MARQUESINA_SECUNDARIA, MARQUESINA_TERCERA } from "@/lib/contenido";
import { cerrarSesion } from "@/app/admin/login/actions";
import type { CategoriaDestacada } from "@/lib/productos";
import type { HeroSlide } from "@/lib/hero";
import type { Tienda } from "@/lib/tienda";

type Zona = "prendas" | "portada" | "vista";

const ZONAS: { id: Zona; etiqueta: string }[] = [
  { id: "prendas", etiqueta: "Prendas" },
  { id: "portada", etiqueta: "Portada" },
  { id: "vista", etiqueta: "Vista previa" },
];

export function AdminDashboard({
  productos,
  categorias,
  look,
  slides,
  tienda,
  categoriasFijadas,
}: {
  productos: ProductoAdmin[];
  categorias: CategoriaDestacada[];
  look: AdminLook | null;
  slides: HeroSlide[];
  tienda: Tienda;
  categoriasFijadas: string[];
}) {
  // null = formulario cerrado; undefined = abierto en modo "agregar".
  const [editando, setEditando] = useState<ProductoAdmin | undefined | null>(
    null
  );
  const [editandoSlide, setEditandoSlide] = useState<
    HeroSlide | undefined | null
  >(null);
  const [editandoLook, setEditandoLook] = useState<AdminLook | null>(null);
  const [editandoTienda, setEditandoTienda] = useState<Tienda | null>(null);
  const [zona, setZona] = useState<Zona>("prendas");

  // En qué espacios de la portada cae cada prenda. Se calcula una vez acá y
  // baja a la lista de Prendas, que es donde hacía falta decirlo.
  const ubicaciones = useMemo(() => {
    const idsEnLook = new Set((look?.items ?? []).map((i) => i.producto.id));
    return calcularUbicaciones(productos, idsEnLook);
  }, [productos, look]);

  // Mismos recortes que arma la home pública (lib/productos.ts), pero sin el
  // filtro de visible_en_tienda: acá la dueña necesita ver y poder reactivar
  // también lo que está oculto o agotado.
  const { destacados, novedades, edicionLimitada, topSemana, bannerInferior } =
    useMemo(() => {
      return {
        destacados: productos.filter((p) => p.destacado).slice(0, 8),
        novedades: productos.slice(0, 4),
        edicionLimitada:
          productos.find((p) => p.edicion_limitada && p.imagen_url) ?? null,
        topSemana: productos.find((p) => p.top_semana && p.imagen_url) ?? null,
        bannerInferior:
          productos.find((p) => p.banner_inferior && p.imagen_url) ?? null,
      };
    }, [productos]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-linea bg-crema/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-extrabold text-terracota-oscuro">
          Panel de administración
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditando(undefined)}
            className="inline-flex items-center gap-1.5 rounded-full bg-terracota px-4 py-2 text-xs font-semibold text-white transition hover:bg-terracota-oscuro sm:text-sm"
          >
            <Plus size={16} aria-hidden />
            Agregar prenda
          </button>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="rounded-lg p-2 text-terracota-oscuro transition hover:bg-rosa-suave/50"
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      {/* Tres zonas separadas a propósito: el inventario (una prenda, una
          vez), la portada (cada espacio rotulado) y la web tal cual, que
          queda solo para mirar. Antes todo era lo último, y editar desde ahí
          hacía creer que se tocaba un único sitio. */}
      <nav
        className="sticky top-[57px] z-20 border-b border-linea bg-crema/95 backdrop-blur"
        aria-label="Zonas del panel"
      >
        <div className="mx-auto flex max-w-6xl gap-1 px-4">
          {ZONAS.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setZona(z.id)}
              aria-current={zona === z.id}
              className={`-mb-px border-b-2 px-3 py-3 text-sm font-semibold transition ${
                zona === z.id
                  ? "border-terracota text-terracota-oscuro"
                  : "border-transparent text-carbon-suave hover:text-carbon"
              }`}
            >
              {z.etiqueta}
            </button>
          ))}
        </div>
      </nav>

      {zona === "prendas" && (
        <AdminPrendas
          productos={productos}
          ubicaciones={ubicaciones}
          onEditar={setEditando}
          onAgregar={() => setEditando(undefined)}
        />
      )}

      {zona === "portada" && (
        <AdminPortada
          productos={productos}
          categorias={categorias}
          categoriasFijadas={categoriasFijadas}
          slides={slides}
          look={look}
          tienda={tienda}
          destacados={destacados}
          novedades={novedades}
          edicionLimitada={edicionLimitada}
          topSemana={topSemana}
          bannerInferior={bannerInferior}
          onEditar={setEditando}
          onEditarSlide={setEditandoSlide}
          onAgregarSlide={() => setEditandoSlide(undefined)}
          onEditarLook={setEditandoLook}
          onEditarTienda={setEditandoTienda}
        />
      )}

      {zona === "vista" && (
      <>
      <p className="mx-auto max-w-6xl px-4 pt-5 text-center text-xs text-carbon-suave">
        La web tal como la ve la clienta. Es solo para mirar: para cambiar algo,
        usa <strong>Prendas</strong> o <strong>Portada</strong>.
      </p>

      <main className="pointer-events-none mt-2 select-none">
        <AdminHero
          slides={slides}
          onEditar={setEditandoSlide}
          onAgregar={() => setEditandoSlide(undefined)}
        />

        <div className="mx-auto max-w-6xl px-4">
          <AdminSeccionDestacados
            productos={destacados}
            titulo="Los más pedidos"
            onEditar={setEditando}
          />
        </div>

        <AdminSeccionCategorias categorias={categorias} />

        <BandaMarquesina />

        <div className="mx-auto max-w-6xl px-4">
          <AdminGridProductos
            titulo="Nuevos ingresos"
            productos={novedades}
            columnas="grid-cols-2"
            onEditar={setEditando}
            vacioTexto="Todavía no hay prendas publicadas."
          />
        </div>

        <AdminBannerEdicionLimitada
          producto={edicionLimitada}
          titulo="Edición limitada"
          etiqueta="Edición limitada"
          onEditar={setEditando}
        />

        <BandaMarquesina
          mensaje={MARQUESINA_SECUNDARIA}
          tono="terracota"
          className="mt-0"
        />

        <AdminSeccionTopSemana producto={topSemana} onEditar={setEditando} />

        <AdminBannerEdicionLimitada
          producto={bannerInferior}
          titulo="Recién llegado"
          etiqueta="Recién llegado"
          fondo="bg-crema"
          onEditar={setEditando}
        />

        <BandaMarquesina mensaje={MARQUESINA_TERCERA} className="mt-0" />

        <AdminSeccionShopTheLook
          look={look}
          onEditar={setEditando}
          onEditarLook={setEditandoLook}
        />

        {/* La foto del stand sí se edita; la franja de garantías es texto fijo
            del sitio y se muestra solo como referencia. */}
        <div className="relative">
          <BannerTiendaVista tienda={tienda} />
          <button
            type="button"
            onClick={() => setEditandoTienda(tienda)}
            className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-carbon shadow-md transition hover:bg-white"
          >
            <Pencil size={14} aria-hidden />
            {tienda.foto_url ? "Editar la tienda" : "Agregar foto del local"}
          </button>
        </div>
        <div className="pointer-events-none opacity-95">
          <FranjaGarantias />
        </div>

      </main>
      </>
      )}

      {editando !== null && (
        <ProductForm producto={editando} onCerrar={() => setEditando(null)} />
      )}
      {editandoSlide !== null && (
        <SlideForm
          slide={editandoSlide}
          onCerrar={() => setEditandoSlide(null)}
        />
      )}
      {editandoLook !== null && (
        <LookForm look={editandoLook} onCerrar={() => setEditandoLook(null)} />
      )}
      {editandoTienda !== null && (
        <TiendaForm
          tienda={editandoTienda}
          onCerrar={() => setEditandoTienda(null)}
        />
      )}
    </div>
  );
}
