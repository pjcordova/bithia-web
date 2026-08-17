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

// Next carga el .env con dotenv-expand, que trata `$` como inicio de variable.
// Sin escapar, `$2a$12$...` llega mutilado (46 caracteres en vez de 60) y el
// login rechaza la contraseña correcta sin dar ninguna pista del motivo.
const escapado = hash.replace(/\$/g, "\\$");

console.log("\nPega esta línea tal cual en tu .env:\n");
console.log(`ADMIN_PASSWORD_HASH="${escapado}"\n`);
console.log("Las barras invertidas son necesarias — no las quites.\n");
