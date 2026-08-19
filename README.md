# Bithia Web

Catálogo público + carrito que deriva el pedido a WhatsApp + panel de administración
para Bithia Brand (Galería Polvos Rosados, Ica).

Proyecto **independiente del ERP**: base de datos propia, repositorio propio, sin
compartir nada con el Postgres de Railway. La verificación de stock es humana, a
través del código de lote que viaja en cada línea del pedido.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 · Neon (Postgres)
· Cloudinary · Vercel

## Puesta en marcha

```bash
npm install
```

Copia `.env.example` a `.env` y rellena los valores (ver abajo). Después:

```bash
npm run db:push    # crea las tablas en Neon
npm run db:seed    # opcional: 4 prendas de ejemplo
npm run dev
```

El sitio queda en http://localhost:3000 y el panel en http://localhost:3000/admin.

## Variables de entorno

| Variable | Para qué | ¿Secreta? |
|---|---|---|
| `DATABASE_URL` | Connection string de Neon (pooled, con `?sslmode=require`) | Sí |
| `ADMIN_EMAIL` | Correo con el que entra la dueña | No |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt de su contraseña | Sí |
| `AUTH_SECRET` | Firma la cookie de sesión (mínimo 32 caracteres) | Sí |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cuenta de Cloudinary | No (va al navegador) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Preset **sin firmar** para subir fotos | No (va al navegador) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número destino del pedido, solo dígitos (`51...`) | No |

### Generar las credenciales del panel

```bash
npm run admin:hash -- "la-contraseña-de-la-dueña"
```

Imprime la línea `ADMIN_PASSWORD_HASH="..."` lista para pegar en `.env`.
La contraseña en texto plano no se guarda en ningún lado.

El hash sale con los `$` escapados (`\$2a\$12\$...`) y hay que pegarlo así. Next
carga el `.env` con `dotenv-expand`, que interpreta `$` como inicio de variable:
sin las barras el hash llega mutilado (46 caracteres en vez de 60) y el login
rechaza la contraseña correcta sin dar ninguna pista del motivo. Ni las comillas
simples evitan esto.

En Vercel, en cambio, las variables se pegan **sin escapar** — el panel no
expande nada. Es el mismo valor con distinto formato en cada sitio.

Para `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configurar Cloudinary

Las fotos se suben **del navegador directo a Cloudinary**, sin pasar por el
servidor. Eso requiere un *upload preset* sin firmar:

1. Cloudinary → Settings → Upload → Upload presets → *Add upload preset*.
2. Signing Mode: **Unsigned**.
3. Folder: `bithia-web` (mantiene las fotos del sitio separadas de las del ERP).
4. Copia el nombre del preset a `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

El API Secret de Cloudinary **no se usa en este proyecto** y no debe ponerse aquí.

## Modelo de datos

`productos` (uno por prenda) y `tallas` (qué tallas maneja esa prenda).

No hay cantidad de stock: eso vive solo en el ERP. `disponible` es un booleano
que la dueña marca a criterio propio, y `visible_en_tienda` permite ocultar una
prenda sin borrarla.

Tampoco hay tabla de pedidos — **WhatsApp es el registro**.

### Código de lote

Formato `VES-2508-03` = prefijo de categoría + año/mes + correlativo. Se genera
solo al crear la prenda; el formulario permite escribirlo a mano si hace falta.
Es la referencia que usa el personal para verificar el stock real en el ERP
antes de confirmar una venta.

## Estructura

```
src/
├── app/
│   ├── page.tsx                 Home
│   ├── catalogo/                Catálogo (filtro por categoría, talla secundaria)
│   ├── producto/[id]/           Detalle de prenda
│   ├── carrito/                 Carrito → WhatsApp
│   └── admin/
│       ├── login/               Login + acciones de sesión
│       ├── page.tsx             Dashboard
│       └── actions.ts           Server Actions de producto
├── components/
├── lib/
└── middleware.ts                Protege /admin
```

`middleware.ts` va dentro de `src/` porque el proyecto usa carpeta `src`. En la
raíz Next lo ignora en silencio y el panel queda expuesto.

## Despliegue en Vercel

1. Importar el repositorio en Vercel.
2. Cargar todas las variables de la tabla de arriba en Settings → Environment Variables.
3. Desplegar. `postinstall` corre `prisma generate` automáticamente.
4. Aplicar el esquema a la base de producción con `npm run db:push` apuntando al
   `DATABASE_URL` de producción.

Las páginas públicas se revalidan cada hora (ISR). Si Neon no responde durante un
build, el catálogo sale vacío y se registra el error, pero el despliegue no falla
— así una caída momentánea de la base no bloquea también el panel.

## Fuera de alcance del MVP

Pago online, cuentas de cliente y tabla de pedidos propia. El diseño no
cierra la puerta a agregar pagos más adelante.

La sincronización de stock con el ERP tiene el lado de `bithia-web` ya
preparado (avisa al ERP por HTTP al confirmar un pedido) pero inactivo hasta
que el ERP exponga su endpoint — ver
[`docs/integracion-erp-stock.md`](docs/integracion-erp-stock.md).
