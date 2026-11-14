"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Package, Plus, Trash2 } from "lucide-react";
import type { ProductoAdmin } from "@/components/admin/ProductForm";
import type { Coleccion } from "@/lib/colecciones";
import { SelectorPrendas } from "@/components/admin/SelectorPrendas";
import {
  crearColeccion,
  despublicarColeccion,
  eliminarColeccion,
  fijarPrendasDeColeccion,
  publicarColeccion,
  type ColeccionState,
} from "@/app/admin/actions";

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg bg-terracota px-4 py-2.5 text-sm font-bold text-white transition hover:bg-terracota-oscuro disabled:opacity-50"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      {pending ? "Creando..." : "Crear"}
    </button>
  );
}

/**
 * Colecciones: una tanda de mercadería que se arma con calma y se suelta
 * entera.
 *
 * El stand se renueva cada 15 días y hasta ahora cada prenda había que
 * publicarla de a una. Acá se crea la tanda, se le asignan prendas —que
 * pueden quedar sin publicar mientras se arma— y al publicarla salen todas
 * juntas y pasan a ser los "Nuevos ingresos" de la portada.
 */
export function AdminColecciones({
  colecciones,
  productos,
  prendasPorColeccion,
}: {
  colecciones: Coleccion[];
  productos: ProductoAdmin[];
  /** id de colección → ids de sus prendas. */
  prendasPorColeccion: Record<string, string[]>;
}) {
  const router = useRouter();
  const [estado, crear] = useActionState<ColeccionState, FormData>(
    crearColeccion,
    {}
  );
  const [eligiendo, setEligiendo] = useState<Coleccion | null>(null);

  useEffect(() => {
    if (estado.ok) router.refresh();
  }, [estado.ok, router]);

  const vigente = colecciones.find((c) => c.publicada_at !== null);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="text-xl font-extrabold text-carbon">Colecciones</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-carbon-suave">
        Una colección es una carga de mercadería. Créala, ponle las prendas de
        la quincena —pueden quedar sin publicar mientras la armas— y cuando
        esté lista, publícala: salen todas a la vez y pasan a ser los “Nuevos
        ingresos” de la portada.
      </p>

      <form action={crear} className="mt-5 flex flex-wrap items-start gap-2.5">
        <div className="min-w-[14rem] flex-1">
          <input
            type="text"
            name="nombre"
            required
            placeholder="Ej. Quincena de noviembre"
            aria-label="Nombre de la colección"
            className="w-full rounded-lg border border-linea bg-white px-3 py-2.5 text-sm text-carbon outline-none focus:border-terracota"
          />
          {estado.error && (
            <p role="alert" className="mt-1.5 text-xs text-rosa">
              {estado.error}
            </p>
          )}
        </div>
        <BotonCrear />
      </form>

      {colecciones.length === 0 ? (
        <div className="mt-6 rounded-tarjeta bg-white p-8 text-center sombra-tarjeta">
          <Package className="mx-auto text-carbon-suave" size={28} aria-hidden />
          <p className="mt-3 text-sm text-carbon-suave">
            Todavía no hay colecciones. Mientras no publiques ninguna, “Nuevos
            ingresos” sigue mostrando las 4 prendas más recientes, como hasta
            ahora.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {colecciones.map((c) => (
            <FilaColeccion
              key={c.id}
              coleccion={c}
              esVigente={vigente?.id === c.id}
              onElegirPrendas={() => setEligiendo(c)}
            />
          ))}
        </ul>
      )}

      {eligiendo && (
        <SelectorPrendas
          titulo={`Prendas de “${eligiendo.nombre}”`}
          explicacion="Elige las prendas de esta carga. Las que quites no se borran ni se ocultan: vuelven a quedar sueltas en el catálogo."
          productos={productos}
          seleccionInicial={prendasPorColeccion[eligiendo.id] ?? []}
          maximo={60}
          permiteVacio
          incluirSinPublicar
          onGuardar={(ids) => fijarPrendasDeColeccion(eligiendo.id, ids)}
          onCerrar={() => setEligiendo(null)}
        />
      )}
    </section>
  );
}

function FilaColeccion({
  coleccion,
  esVigente,
  onElegirPrendas,
}: {
  coleccion: Coleccion;
  esVigente: boolean;
  onElegirPrendas: () => void;
}) {
  const router = useRouter();
  const [ocupado, iniciar] = useTransition();
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const publicada = coleccion.publicada_at !== null;
  const sinPublicar = coleccion.prendas - coleccion.publicadas;

  function ejecutar(accion: () => Promise<void>) {
    iniciar(async () => {
      await accion();
      router.refresh();
    });
  }

  return (
    <li className="rounded-tarjeta bg-white p-4 sombra-tarjeta">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold text-carbon">
              {coleccion.nombre}
            </h3>
            {esVigente && (
              <span className="flex items-center gap-1 rounded-full bg-terracota px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <CheckCircle2 size={11} />
                En portada
              </span>
            )}
            {publicada && !esVigente && (
              <span className="rounded-full bg-linea px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-carbon-suave">
                Publicada antes
              </span>
            )}
            {!publicada && (
              <span className="rounded-full bg-rosa-suave px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-terracota-oscuro">
                Borrador
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-carbon-suave">
            {coleccion.prendas}{" "}
            {coleccion.prendas === 1 ? "prenda" : "prendas"}
            {sinPublicar > 0 && ` · ${sinPublicar} sin publicar`}
            {coleccion.publicada_at &&
              ` · publicada el ${coleccion.publicada_at.toLocaleDateString("es-PE", { day: "numeric", month: "long" })}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onElegirPrendas}
            disabled={ocupado}
            className="rounded-full border border-linea px-3.5 py-1.5 text-xs font-bold text-carbon transition hover:border-terracota hover:text-terracota-oscuro disabled:opacity-50"
          >
            Elegir prendas
          </button>

          {!publicada ? (
            <button
              type="button"
              onClick={() => ejecutar(() => publicarColeccion(coleccion.id))}
              disabled={ocupado || coleccion.prendas === 0}
              title={
                coleccion.prendas === 0
                  ? "Primero asígnale prendas"
                  : undefined
              }
              className="flex items-center gap-1.5 rounded-full bg-terracota px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-terracota-oscuro disabled:opacity-40"
            >
              {ocupado && <Loader2 size={12} className="animate-spin" />}
              Publicar colección
            </button>
          ) : (
            <button
              type="button"
              onClick={() => ejecutar(() => despublicarColeccion(coleccion.id))}
              disabled={ocupado}
              className="rounded-full border border-linea px-3.5 py-1.5 text-xs font-bold text-carbon-suave transition hover:text-carbon disabled:opacity-50"
            >
              Quitar de portada
            </button>
          )}

          <button
            type="button"
            onClick={() => setConfirmandoBorrado((v) => !v)}
            disabled={ocupado}
            aria-label={`Eliminar ${coleccion.nombre}`}
            className="rounded-lg p-1.5 text-carbon-suave transition hover:text-rosa disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {confirmandoBorrado && (
        <p className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-rosa-suave/40 px-3 py-2.5 text-xs text-terracota-oscuro">
          ¿Eliminar esta colección? Sus prendas no se borran: quedan sueltas en
          el catálogo.
          <button
            type="button"
            onClick={() => ejecutar(() => eliminarColeccion(coleccion.id))}
            className="rounded-full bg-rosa px-3 py-1 font-bold text-white transition hover:brightness-95"
          >
            Sí, eliminar
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoBorrado(false)}
            className="underline underline-offset-2"
          >
            Cancelar
          </button>
        </p>
      )}
    </li>
  );
}
