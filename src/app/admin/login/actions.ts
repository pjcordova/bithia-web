"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export type LoginState = { error?: string };

// Mismo mensaje para correo inexistente y contraseña incorrecta: no revela
// cuál de los dos falló.
const CREDENCIALES_INVALIDAS = "Correo o contraseña incorrectos.";

export async function iniciarSesion(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completa tu correo y contraseña." };
  }

  const emailEsperado = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const hashEsperado = process.env.ADMIN_PASSWORD_HASH ?? "";

  const secreto = process.env.AUTH_SECRET ?? "";

  // Sin estas tres variables el login no puede funcionar. Se avisa con un
  // mensaje claro en vez de dejar que reviente al firmar la cookie.
  if (!emailEsperado || !hashEsperado || secreto.length < 32) {
    const faltan = [
      !emailEsperado && "ADMIN_EMAIL",
      !hashEsperado && "ADMIN_PASSWORD_HASH",
      secreto.length < 32 && "AUTH_SECRET (mínimo 32 caracteres)",
    ].filter(Boolean);
    return {
      error: `El panel no está configurado todavía. Falta en el servidor: ${faltan.join(", ")}.`,
    };
  }

  // Se compara el hash siempre, incluso si el correo no coincide, para que el
  // tiempo de respuesta no delate si el correo existe.
  const passwordOk = await bcrypt.compare(password, hashEsperado);
  if (email !== emailEsperado || !passwordOk) {
    return { error: CREDENCIALES_INVALIDAS };
  }

  const token = await createSessionToken(email);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect("/admin");
}

export async function cerrarSesion() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
