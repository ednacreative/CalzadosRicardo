# Calzados Ricardo — web

Tienda de calzado: **escaparate + catálogo filtrable + tienda online** (carrito y
checkout). Sitio **estático**, sin framework, desplegado en GitHub Pages.

> El nombre «Calzados Ricardo», las marcas, los productos, precios, stock y fotos
> son **ficticios / placeholder**. Sustitúyelos por los reales cuando corresponda.

## Stack

- HTML + un único `css/styles.css` (sistema de diseño con variables).
- JavaScript "vanilla" (sin dependencias salvo Leaflet en la página de contacto).
- Catálogo en `data/productos.json` (fuente) + copia `data/productos.js`
  (`window.CR_DB`) para poder abrir los HTML sin servidor.
- Generador: `scripts/generar-datos.mjs` (`npm run datos`) — 40 productos
  ficticios (hombre / mujer / niño), con tallas, colores, stock y rebajas.
- Imágenes: placeholders de `images.unsplash.com` (pool `FOTOS` en el generador),
  con respaldo automático a `picsum.photos` si algún recurso falla.
- Formularios (contacto y pedido de checkout) por email con
  [FormSubmit](https://formsubmit.co), sin backend.

## Páginas

```
index.html                Portada: hero, categorías, destacados, novedades
tienda.html               Catálogo filtrable (género, tipo, marca, talla, precio, orden)
producto.html?id=CR-XXXX  Ficha: galería, color, talla+stock, añadir a la cesta
carrito.html              Cesta completa: cantidades, resumen, envío
checkout.html             Datos de envío + resumen → pedido por email
favoritos.html            Productos guardados (localStorage)
nosotros.html             La tienda / marcas
contacto.html             Formulario + datos + mapa de la tienda
envios-devoluciones.html  Plazos, costes, cambios y guía de tallas
```

## JavaScript

```
js/layout.js        Cabecera, pie, panel lateral de la cesta, menú móvil, respaldo de imágenes
js/data.js          window.CR: catálogo, filtros, formato de precio, tarjeta de producto
js/carrito.js       window.CRCarrito: cesta en localStorage (referencias + resolver totales)
js/favoritos.js     window.CRFav: favoritos en localStorage
js/forms.js         window.CRForms: envío de formularios por email (FormSubmit)
js/home.js          Portada
js/tienda.js        Catálogo
js/producto.js      Ficha de producto
js/carrito-page.js  Página de la cesta
js/checkout.js      Checkout: formulario + resumen + envío del pedido
```

## Uso en local

`index.html` con doble clic funciona para navegar (los formularios NO se envían
desde `file://`). Para todo, sirve por HTTP:

```bash
npm run dev        # http://localhost:3000
```

## Pedidos y contacto por email (FormSubmit)

El **checkout** y el **formulario de contacto** envían un email con
[FormSubmit](https://formsubmit.co). Destinatario en `js/forms.js`
(`DESTINO`): `edna.creativestudio@gmail.com`.

> **Activación (una sola vez):** el primer envío genera un correo de FormSubmit
> con un botón **"Activate Form"**. Al pulsarlo quedan operativos los dos
> formularios. Los envíos anteriores no se reenvían.

Los campos van numerados (`01.`, `02.`, …) para que el email respete el orden.

## Regenerar el catálogo ficticio

```bash
npm run datos      # -> data/productos.json + data/productos.js
```

Edita `scripts/generar-datos.mjs` (número de productos, marcas, familias,
precios, pool de fotos) o sustituye directamente `data/productos.json`.

Modelo de producto: `id`, `nombre`, `marca`, `genero` (hombre|mujer|niño),
`categoria`, `precio`, `precio_antes`, `en_rebaja`, `destacado`, `novedad`,
`colores[]` (nombre + hex), `tallas[]`, `stock{talla: unidades}`, `material`,
`descripcion`, `caracteristicas[]`, `imagenes[]`.

## Despliegue

`push` a `main` → workflow `deploy-pages.yml` publica en GitHub Pages
(**Settings → Pages → Source: GitHub Actions**).

## Fase 2 (pendiente)

- Pasarela de pago real (Stripe, Redsys, o plataforma tipo Snipcart/Shopify).
- Stock y pedidos en un backend (ahora el stock es del JSON y el pedido va por email).
- Cuenta de cliente y seguimiento de pedidos.
- Textos legales reales y aviso de cookies.
