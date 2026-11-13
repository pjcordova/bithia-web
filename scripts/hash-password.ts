/**
 * Genera el hash bcrypt para ADMIN_PASSWORD_HASH.
 *
 *   npm run admin:hash -- "mi-contraseña-secreta"
 *
 * Copia la línea que imprime dentro de tu archivo .env.
 * La contraseña en texto plano no se guarda en ningún lado.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Uso: npm run admin:hash -- "tu-contraseña"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

// Se entrega en base64 a propósito. Next carga el .env con dotenv-expand, que
// trata los `$` del hash como nombres de variable y lo deja mutilado —18
// caracteres en vez de 60— sin que comillas ni barras de escape lo eviten; el
// login rechaza entonces la contraseña correcta sin dar ninguna pista. En
// base64 no hay `$`, así que llega intacto, y el mismo valor sirve en Vercel.
const codificado = Buffer.from(hash, "utf8").toString("base64");

console.log("\nPega esta línea tal cual en tu .env:\n");
console.log(`ADMIN_PASSWORD_HASH="${codificado}"\n`);
console.log("Y en Vercel, en ADMIN_PASSWORD_HASH, solo el valor:\n");
console.log(`${codificado}\n`);
console.log("Es el mismo valor en los dos sitios. La contraseña en texto");
console.log("plano no se guarda en ningún lado.\n");
