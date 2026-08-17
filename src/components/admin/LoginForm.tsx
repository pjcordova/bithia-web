"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { iniciarSesion, type LoginState } from "@/app/admin/login/actions";

function BotonIngresar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-terracota py-3 text-sm font-semibold text-white transition hover:bg-terracota-oscuro disabled:opacity-50"
    >
      {pending ? "Ingresando..." : "Ingresar"}
      {!pending && <ArrowRight size={16} aria-hidden />}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    iniciarSesion,
    {}
  );

  return (
    <form action={formAction} className="mt-8">
      <label
        htmlFor="email"
        className="block text-[11px] font-bold uppercase tracking-wide text-terracota-oscuro"
      >
        Correo electrónico
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        required
        placeholder="admin@bithiabrand.com"
        className="mt-2 w-full rounded-lg border border-linea bg-crema px-4 py-3 text-sm text-carbon placeholder:text-carbon-suave focus:border-terracota focus:outline-none"
      />

      <label
        htmlFor="password"
        className="mt-5 block text-[11px] font-bold uppercase tracking-wide text-terracota-oscuro"
      >
        Contraseña
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        className="mt-2 w-full rounded-lg border border-linea bg-crema px-4 py-3 text-sm text-carbon placeholder:text-carbon-suave focus:border-terracota focus:outline-none"
      />

      {state.error && (
        <p role="alert" className="mt-4 text-sm text-rosa">
          {state.error}
        </p>
      )}

      <BotonIngresar />
    </form>
  );
}
