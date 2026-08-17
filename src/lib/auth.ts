import { SignJWT, jwtVerify } from "jose";

// Toda la autenticación del panel vive en este archivo. Hoy es un único admin
// con correo + contraseña; si más adelante se migra a Neon Auth (magic link),
// basta con reemplazar estas funciones sin tocar páginas ni acciones.

export const SESSION_COOKIE = "bithia_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET falta o es muy corto (mínimo 32 caracteres). Revisa tu .env."
    );
  }
  return new TextEncoder().encode(secret);
}

export type Session = {
  email: string;
};

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

/** Devuelve la sesión si el token es válido, o null. Nunca lanza. */
export async function verifySessionToken(
  token: string | undefined
): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
