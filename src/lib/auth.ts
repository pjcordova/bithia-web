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

/** Un hash bcrypt: $2a$12$ más 53 caracteres de sal y resumen. */
const FORMATO_BCRYPT = /^\$2[aby]\$\d{2}\$[A-Za-z0-9./]{53}$/;

/**
 * Hash de la contraseña del panel, venga como venga la variable.
 *
 * Se acepta en base64 además de en texto plano, y es la forma recomendada:
 * en local, Next carga el .env con dotenv-expand, que trata los `$` del hash
 * como nombres de variable y lo entrega mutilado —18 caracteres en vez de
 * 60— sin importar comillas ni barras de escape. El login entonces rechaza
 * la contraseña correcta sin dar ninguna pista. En base64 no hay `$`, así
 * que llega intacto, y el mismo valor sirve igual en Vercel.
 *
 * Se sigue aceptando el hash en texto plano para no romper despliegues que
 * ya lo tengan así: en Vercel las variables no se expanden y funciona bien.
 */
export function hashAdmin(): string {
  const crudo = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
  if (!crudo) return "";
  if (FORMATO_BCRYPT.test(crudo)) return crudo;

  try {
    const decodificado = Buffer.from(crudo, "base64").toString("utf8");
    if (FORMATO_BCRYPT.test(decodificado)) return decodificado;
  } catch {
    // No era base64 válido; se cae al retorno de abajo.
  }

  // Ni hash ni base64: se devuelve vacío para que el login avise de que el
  // panel no está configurado, en vez de rechazar la contraseña correcta.
  return "";
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
