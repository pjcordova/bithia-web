"use client";

import { useMemo, useState } from "react";
import { LogOut, Plus } from "lucide-react";
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
import { BandaMarquesina } from "@/components/BandaMarquesina";
import { BannerTienda } from "@/components/BannerTienda";
import { FranjaGarantias } from "@/components/FranjaGarantias";
import { MARQUESINA_SECUNDARIA, MARQUESINA_TERCERA } from "@/lib/contenido";
import { cerrarSesion } from "@/app/admin/login/actions";
import type { CategoriaDestacada } from "@/lib/productos";
import type { HeroSlide } from "@/lib/hero";

export function AdminDashboard({
  productos,
  categorias,
  look,
  slides,
}: {
  productos: ProductoAdmin[];
  categorias: CategoriaDestacada[];
  look: AdminLook | null;
  slides: HeroSlide[];
}) {
  // null = formulario cerrado; undefined = abierto en modo "agregar".
  const [editando, setEditando] = useState<ProductoAdmin | undefined | null>(
    null
  );
  const [editandoSlide, setEditandoSlide] = useState<
    HeroSlide | undefined | null
  >(null);

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

      <p className="mx-auto max-w-6xl px-4 pt-4 text-center text-xs text-carbon-suave">
        Esta es la misma página que ve la clienta, en el mismo orden. Toca
        cualquier foto para editar esa prenda.
      </p>

      <main>
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

        <AdminSeccionShopTheLook look={look} onEditar={setEditando} />

        <div className="pointer-events-none opacity-95">
          <BannerTienda />
          <FranjaGarantias />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-10">
          <AdminGridProductos
            titulo="Todo el inventario"
            productos={productos}
            columnas="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            onEditar={setEditando}
            vacioTexto='Todavía no has agregado prendas. Toca "Agregar prenda" para publicar la primera.'
          />
        </div>
      </main>

      {editando !== null && (
        <ProductForm producto={editando} onCerrar={() => setEditando(null)} />
      )}
      {editandoSlide !== null && (
        <SlideForm
          slide={editandoSlide}
          onCerrar={() => setEditandoSlide(null)}
        />
      )}
    </div>
  );
}
