"use client";

import { useState, type ReactNode } from "react";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import type { CategoriaDestacada } from "@/lib/productos";
import type { HeroSlide } from "@/lib/hero";
import type { Tienda } from "@/lib/tienda";
import { AdminHero } from "@/components/admin/AdminHero";
import { AdminSeccionDestacados } from "@/components/admin/AdminSeccionDestacados";
import { AdminSeccionCategorias } from "@/components/admin/AdminSeccionCategorias";
import { AdminGridProductos } from "@/components/admin/AdminGridProductos";
import { AdminBannerEdicionLimitada } from "@/components/admin/AdminBannerEdicionLimitada";
import { AdminSeccionTopSemana } from "@/components/admin/AdminSeccionTopSemana";
import {
  AdminSeccionShopTheLook,
  type AdminLook,
} from "@/components/admin/AdminSeccionShopTheLook";
import { BannerTiendaVista } from "@/components/BannerTienda";
import { SelectorPrendas } from "@/components/admin/SelectorPrendas";
import { CategoriaFotoForm } from "@/components/admin/CategoriaFotoForm";
import {
  fijarDestacados,
  fijarProtagonista,
  type CampoBanda,
} from "@/app/admin/actions";
import { Pencil } from "lucide-react";

/** Espacios de la portada cuyo contenido se elige con el selector. */
type EspacioElegible =
  | { tipo: "destacados" }
  | { tipo: "banda"; campo: CampoBanda; titulo: string };

/**
 * La portada por secciones, cada una rotulada y con una línea que explica de
 * dónde salen sus prendas.
 *
 * Es lo contrario de la vista previa: allá se ve la web tal cual, que es útil
 * para revisar pero engañoso para editar, porque una prenda sale en varios
 * sitios y no hay forma de saber cuál se está tocando. Acá cada espacio está
 * nombrado y se dice cómo se llena.
 */
export function AdminPortada({
  productos,
  categoriasFijadas,
  categorias,
  slides,
  look,
  tienda,
  destacados,
  novedades,
  edicionLimitada,
  topSemana,
  bannerInferior,
  onEditar,
  onEditarSlide,
  onAgregarSlide,
  onEditarLook,
  onEditarTienda,
}: {
  categorias: CategoriaDestacada[];
  slides: HeroSlide[];
  look: AdminLook | null;
  tienda: Tienda;
  destacados: ProductoAdmin[];
  novedades: ProductoAdmin[];
  edicionLimitada: ProductoAdmin | null;
  topSemana: ProductoAdmin | null;
  bannerInferior: ProductoAdmin | null;
  onEditar: (producto: ProductoAdmin) => void;
  onEditarSlide: (slide: HeroSlide) => void;
  onAgregarSlide: () => void;
  onEditarLook: (look: AdminLook) => void;
  onEditarTienda: (tienda: Tienda) => void;
  productos: ProductoAdmin[];
  categoriasFijadas: string[];
}) {
  const [eligiendo, setEligiendo] = useState<EspacioElegible | null>(null);
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
  const fijadas = new Set(categoriasFijadas);

  const DATOS_SELECTOR: Record<
    string,
    { titulo: string; explicacion: string; seleccion: string[]; maximo: number }
  > = {
    destacados: {
      titulo: "Elegir “Los más pedidos”",
      explicacion:
        "Hasta 8 prendas. Se guarda exactamente lo que elijas: las que quites dejan de salir en esa fila.",
      seleccion: destacados.map((p) => p.id),
      maximo: 8,
    },
    edicion_limitada: {
      titulo: "Elegir la prenda de “Edición limitada”",
      explicacion:
        "Esta banda muestra una sola prenda. Al elegir una, cualquier otra que estuviera marcada deja de estarlo.",
      seleccion: edicionLimitada ? [edicionLimitada.id] : [],
      maximo: 1,
    },
    top_semana: {
      titulo: "Elegir la prenda de “Top de la semana”",
      explicacion:
        "Una sola prenda, con su galería de fotos. Al elegir otra, la anterior deja de estar marcada.",
      seleccion: topSemana ? [topSemana.id] : [],
      maximo: 1,
    },
    banner_inferior: {
      titulo: "Elegir la prenda de la banda inferior",
      explicacion:
        "Una sola prenda. Al elegir otra, la anterior deja de estar marcada.",
      seleccion: bannerInferior ? [bannerInferior.id] : [],
      maximo: 1,
    },
  };

  const clave =
    eligiendo?.tipo === "destacados" ? "destacados" : eligiendo?.campo;
  const datos = clave ? DATOS_SELECTOR[clave] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="text-xl font-extrabold text-carbon">Portada</h2>
      <p className="mt-1 max-w-2xl text-sm text-carbon-suave">
        Cada bloque es un espacio de la página de inicio, en el orden en que se
        ven. Debajo de cada título dice cómo se decide qué prenda ocupa ese
        espacio.
      </p>

      <div className="mt-6 space-y-5">
        <Bloque
          numero={1}
          titulo="Carrusel principal"
          comoSeLlena="Lo primero que se ve. Las diapositivas se crean y ordenan acá; no dependen de ninguna prenda."
        >
          <AdminHero
            slides={slides}
            onEditar={onEditarSlide}
            onAgregar={onAgregarSlide}
          />
        </Bloque>

        <Bloque
          numero={2}
          titulo="Los más pedidos"
          accion={{ etiqueta: "Elegir prendas", onClick: () => setEligiendo({ tipo: "destacados" }) }}
          comoSeLlena="Muestra hasta 8 prendas marcadas como “Mostrar en Los más pedidos” dentro de cada prenda, de la más nueva a la más vieja."
        >
          <AdminSeccionDestacados
            productos={destacados}
            titulo=""
            onEditar={onEditar}
          />
        </Bloque>

        <Bloque
          numero={3}
          titulo="Mosaicos de categoría"
          comoSeLlena="Cada mosaico toma automáticamente la foto de la prenda más reciente de esa categoría. No se elige a mano: si subes una prenda nueva de Vestidos, su foto pasa a ilustrar “Vestidos”."
          aviso="Es el espacio que más sorprende, porque la prenda nunca se marcó para esto. Si una categoría muestra una foto que no corresponde, revisa que la prenda más nueva de esa categoría esté bien clasificada."
        >
          <AdminSeccionCategorias
            categorias={categorias}
            fijadas={fijadas}
            onEditarFoto={setEditandoCategoria}
          />
        </Bloque>

        <Bloque
          numero={4}
          titulo="Nuevos ingresos"
          comoSeLlena="Las 4 prendas publicadas más recientes. Es automático: no se marcan ni se eligen."
        >
          <AdminGridProductos
            titulo=""
            productos={novedades}
            columnas="grid-cols-2 md:grid-cols-4"
            onEditar={onEditar}
            vacioTexto="Todavía no hay prendas publicadas."
          />
        </Bloque>

        <Bloque
          numero={5}
          titulo="Banda de edición limitada"
          accion={{ etiqueta: "Elegir prenda", onClick: () => setEligiendo({ tipo: "banda", campo: "edicion_limitada", titulo: "Edición limitada" }) }}
          comoSeLlena="La prenda más reciente marcada como “Edición limitada” que tenga foto. Marcar otra reemplaza a la actual."
        >
          <AdminBannerEdicionLimitada
            producto={edicionLimitada}
            titulo="Edición limitada"
            etiqueta="Edición limitada"
            onEditar={onEditar}
          />
        </Bloque>

        <Bloque
          numero={6}
          titulo="Top de la semana"
          accion={{ etiqueta: "Elegir prenda", onClick: () => setEligiendo({ tipo: "banda", campo: "top_semana", titulo: "Top de la semana" }) }}
          comoSeLlena="La prenda más reciente marcada como “Top de la semana”. Muestra una galería: su foto principal más las adicionales de esa prenda."
        >
          <AdminSeccionTopSemana producto={topSemana} onEditar={onEditar} />
        </Bloque>

        <Bloque
          numero={7}
          titulo="Banda inferior"
          accion={{ etiqueta: "Elegir prenda", onClick: () => setEligiendo({ tipo: "banda", campo: "banner_inferior", titulo: "Banda inferior" }) }}
          comoSeLlena="La prenda más reciente marcada como “Banner inferior”. Funciona igual que la de edición limitada."
        >
          <AdminBannerEdicionLimitada
            producto={bannerInferior}
            titulo="Recién llegado"
            etiqueta="Recién llegado"
            fondo="bg-crema"
            onEditar={onEditar}
          />
        </Bloque>

        <Bloque
          numero={8}
          titulo="Shop the look"
          comoSeLlena="Una foto propia, con prendas señaladas encima. La foto y los textos se editan acá; qué prendas aparecen todavía no se administra desde el panel."
        >
          <AdminSeccionShopTheLook
            look={look}
            onEditar={onEditar}
            onEditarLook={onEditarLook}
          />
        </Bloque>

        <Bloque
          numero={9}
          titulo="Foto de la tienda"
          comoSeLlena="La foto del stand y los datos del local. Se usan también en el pie de todas las páginas."
        >
          <div className="relative">
            <BannerTiendaVista tienda={tienda} />
            <button
              type="button"
              onClick={() => onEditarTienda(tienda)}
              className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-carbon shadow-md transition hover:bg-white"
            >
              <Pencil size={14} aria-hidden />
              {tienda.foto_url ? "Editar la tienda" : "Agregar foto del local"}
            </button>
          </div>
        </Bloque>
      </div>

      <p className="mt-8 rounded-tarjeta bg-white p-5 text-sm leading-relaxed text-carbon-suave sombra-tarjeta">
        Los textos de la barra superior, de las bandas que desfilan y de la
        franja oscura del final todavía están escritos en el código y no se
        pueden cambiar desde acá. Quedan para una siguiente etapa.
      </p>
      <p className="mt-3 text-xs text-carbon-suave">
        Nota: una misma prenda puede ocupar varios de estos espacios a la vez.
        En <strong>Prendas</strong>, cada una dice en cuáles aparece.
      </p>

      {editandoCategoria && (
        <CategoriaFotoForm
          nombre={editandoCategoria}
          fotoActual={
            categorias.find((c) => c.nombre === editandoCategoria)?.imagen ?? null
          }
          esFotoFijada={fijadas.has(editandoCategoria)}
          onCerrar={() => setEditandoCategoria(null)}
        />
      )}

      {eligiendo && datos && (
        <SelectorPrendas
          titulo={datos.titulo}
          explicacion={datos.explicacion}
          productos={productos}
          seleccionInicial={datos.seleccion}
          maximo={datos.maximo}
          permiteVacio={eligiendo.tipo === "banda"}
          onGuardar={async (ids) => {
            if (eligiendo.tipo === "destacados") await fijarDestacados(ids);
            else await fijarProtagonista(eligiendo.campo, ids[0] ?? null);
          }}
          onCerrar={() => setEligiendo(null)}
        />
      )}
    </div>
  );
}

function Bloque({
  numero,
  titulo,
  comoSeLlena,
  aviso,
  accion,
  children,
}: {
  numero: number;
  titulo: string;
  comoSeLlena: string;
  aviso?: string;
  /** Botón para elegir qué prendas ocupan este espacio, si se puede elegir. */
  accion?: { etiqueta: string; onClick: () => void };
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-tarjeta bg-white sombra-tarjeta">
      <div className="border-b border-linea px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-base font-extrabold text-carbon">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracota text-xs text-white">
              {numero}
            </span>
            {titulo}
          </h3>
          {accion && (
            <button
              type="button"
              onClick={accion.onClick}
              className="shrink-0 rounded-full border border-terracota px-3.5 py-1.5 text-xs font-bold text-terracota-oscuro transition hover:bg-terracota hover:text-white"
            >
              {accion.etiqueta}
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-carbon-suave">
          {comoSeLlena}
        </p>
        {aviso && (
          <p className="mt-2 rounded-lg bg-rosa-suave/40 px-3 py-2 text-xs leading-relaxed text-terracota-oscuro">
            {aviso}
          </p>
        )}
      </div>
      <div className="px-1 py-2">{children}</div>
    </section>
  );
}
