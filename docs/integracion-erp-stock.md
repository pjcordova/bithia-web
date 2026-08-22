# Integración con el ERP: descuento automático de stock

## Por qué

`bithia-web` es un proyecto independiente del ERP: base de datos propia, sin
compartir el Postgres de Railway (ver `README.md`). Hoy, cuando llega un
pedido por WhatsApp, alguien tiene que leerlo y descontar el stock a mano en
el ERP, y verificar disponibilidad también a mano. Esta integración no cambia
esa arquitectura — `bithia-web` sigue sin guardar cantidades de stock — solo
automatiza el aviso: cuando la clienta confirma un pedido (adjunta captura de
pago y presiona "Enviar pedido por WhatsApp"), `bithia-web` le hace **una
llamada HTTP al ERP** con lo que se vendió, para que el ERP descuente ahí
mismo.

Si esa llamada falla (el ERP está caído, sin internet, lo que sea), el pedido
**igual se manda por WhatsApp** — nunca se bloquea una venta por esto. El
error queda en el log del servidor para revisarlo a mano ese caso puntual.

## Lo que el ERP tiene que exponer

Un endpoint HTTP, por ejemplo:

```
POST https://<tu-erp>.up.railway.app/api/pedidos/descontar-stock
```

### Autenticación

Header `Authorization: Bearer <API_KEY>`. La API key es un secreto compartido
entre los dos proyectos — generen una cadena aleatoria larga y pónganla en el
`.env` de cada lado (ver más abajo).

### Cuerpo de la petición

```json
{
  "items": [
    { "codigo_lote": "VES-2508-01", "talla": "M", "cantidad": 1 },
    { "codigo_lote": "TOP-2508-03", "talla": "S", "cantidad": 2 }
  ],
  "metodo_pago": "yape"
}
```

- `codigo_lote`: el código que ya usan para verificar stock a mano hoy
  (formato `VES-2508-01`). Es el campo puente entre los dos sistemas.
- `talla`: `"S"`, `"M"` o `"L"`.
- `cantidad`: unidades de esa línea en el pedido.
- `metodo_pago`: `"yape"`, `"plin"` o `"transferencia"` (BCP y BBVA llegan
  ambos como `"transferencia"` — bithia-web no distingue el banco para el
  ERP, solo el destino final del dinero).

Un pedido puede traer varias líneas (varias prendas, o la misma prenda en
tallas distintas).

**Sobre `codigo_lote` y color (ya resuelto del lado del ERP):** en
`bithia-web`, cada color de una prenda es un producto separado con su propio
`codigo_lote`. Del lado del ERP, un producto puede agrupar varios colores
bajo el mismo lote (si se recepcionaron juntos), así que el ERP ahora genera
un código **por color** al recepcionar (ej. `TOP-2508-03-ROJO`), guardado en
`producto_colores.codigo_lote`. `bithia-web` no tiene que cambiar nada: sigue
mandando el mismo `codigo_lote` de siempre — el ERP es quien resuelve sin
ambigüedad. Los productos recepcionados antes de esto siguen funcionando por
el camino viejo (`productos.lote`), que sí puede ser ambiguo si agrupa más
de un color; se resuelve solos en cuanto se vuelven a recepcionar.

### Respuesta esperada

- **200 OK** si se procesó (aunque algún código de lote no exista en su base;
  en ese caso pueden devolver el detalle en el cuerpo, `bithia-web` no lo lee
  por ahora, solo mira el status).
- Cualquier otro status se toma como fallo y queda en el log de `bithia-web`
  para revisión manual — no hace falta que sea perfecto de entrada.

### Tiempo de respuesta

`bithia-web` corta la espera a **5 segundos**. Si su endpoint puede demorar
más (por ejemplo, si dispara otros procesos), respondan 200 apenas encolen el
descuento y procesen el resto de forma asíncrona de su lado.

## Lo que ya está listo del lado de bithia-web

- `src/lib/erp.ts` — la función que arma y manda la petición.
- `src/app/carrito/actions.ts` — la Server Action que se llama justo cuando
  se confirma el pedido (después de subir la captura de pago).
- `.env.example` — ya tiene las tres variables documentadas:
  - `ERP_STOCK_WEBHOOK_URL`
  - `ERP_STOCK_QUERY_URL` (ver sección de stock en vivo, más abajo)
  - `ERP_STOCK_API_KEY`

**No hace falta tocar nada más de este lado.** En cuanto el endpoint exista,
solo hay que completar esas variables en el `.env` de producción (Vercel) y
en el local, y el descuento automático empieza a funcionar solo — mientras
tanto, con las variables vacías, el sistema sigue funcionando exacto igual
que ahora (sin el aviso automático).

## Stock en vivo en el catálogo (segundo endpoint, opcional)

Además del descuento, `bithia-web` ahora puede mostrar el stock real por
talla en la ficha de producto (en vez de solo el toggle manual
disponible/agotado), consultando al ERP en el momento en que la clienta abre
la página.

```
POST https://<tu-erp>.up.railway.app/api/productos/stock
```

Mismo header `Authorization: Bearer <API_KEY>` que el endpoint de descuento
(es la misma key, no hace falta una segunda).

**Cuerpo de la petición:**
```json
{ "codigos": ["TOP-2508-03-ROJO", "VES-2508-01"] }
```

**Respuesta esperada:**
```json
{
  "TOP-2508-03-ROJO": [{ "talla": "M", "cantidad": 3 }],
  "VES-2508-01": []
}
```
Un código sin match devuelve array vacío, nunca un error — si el ERP no
responde o no está configurado, `bithia-web` cae de vuelta al toggle manual,
nunca se rompe la ficha de producto por esto. Mismo timeout de 5 segundos que
el endpoint de descuento.

## Cómo probarlo de punta a punta

1. Levantar el ERP local o en Railway con el endpoint arriba implementado.
2. Poner `ERP_STOCK_WEBHOOK_URL` y `ERP_STOCK_API_KEY` en el `.env` de
   `bithia-web` (local o Vercel).
3. Hacer un pedido de prueba en `bithia-web`: agregar una prenda al carrito,
   elegir un método de pago, adjuntar cualquier imagen como comprobante y
   presionar "Enviar pedido por WhatsApp".
4. Revisar en el ERP que el stock de esa prenda/talla bajó.
5. Si algo falla, el motivo queda en los logs del servidor de `bithia-web`
   (Vercel → proyecto → Logs), con las líneas del pedido incluidas.
6. Para el stock en vivo: abrir la ficha de esa prenda en `bithia-web`,
   confirmar que la talla sin stock aparece deshabilitada (o "Agotado" si no
   queda ninguna), y que el aviso de "últimas unidades" aparece cuando quedan
   2 o menos.
