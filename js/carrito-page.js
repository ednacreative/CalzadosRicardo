/* carrito-page.js — página de la cesta. */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var cont = document.getElementById("carrito-cont");
    if (!cont) return;

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    function pintar() {
      CRCarrito.resolver().then(function (r) {
        if (!r || !r.lineas.length) {
          cont.innerHTML =
            '<div class="carrito-vacio"><h2>Tu cesta está vacía</h2>' +
            "<p>Cuando añadas productos aparecerán aquí.</p>" +
            '<a class="btn btn--primario" href="tienda.html">Ir a la tienda</a></div>';
          return;
        }

        var lineas = r.lineas
          .map(function (l) {
            return (
              '<div class="linea-carrito" style="grid-template-columns:96px 1fr auto;padding:1.1rem 0">' +
              '<img src="' +
              l.producto.imagen_principal +
              '" alt="' +
              esc(l.producto.nombre) +
              '" style="width:96px;height:96px">' +
              '<div class="linea-carrito__info">' +
              '<strong><a href="producto.html?id=' +
              encodeURIComponent(l.id) +
              '">' +
              esc(l.producto.nombre) +
              "</a></strong>" +
              "<span>" +
              esc(l.producto.marca) +
              " · Talla " +
              l.talla +
              (l.color ? " · " + esc(l.color) : "") +
              "</span>" +
              '<div class="cant">' +
              '<button data-cant="-1" data-clave="' +
              esc(l.clave) +
              '">−</button><span>' +
              l.cant +
              '</span><button data-cant="1" data-clave="' +
              esc(l.clave) +
              '">+</button></div>' +
              '<button class="enlace-eliminar" data-quitar="' +
              esc(l.clave) +
              '">Eliminar</button>' +
              "</div>" +
              '<div class="linea-carrito__precio">' +
              CR.eur(l.subtotal) +
              '<br><span style="font-weight:400;color:var(--gris-500);font-size:.8rem">' +
              CR.eur(l.precioUnidad) +
              "/ud.</span></div>" +
              "</div>"
            );
          })
          .join("");

        var barra = "";
        if (r.envio > 0) {
          barra =
            '<p class="texto-apoyo" style="margin:.4rem 0 0;font-size:.88rem">Te faltan <strong>' +
            CR.eur(r.faltaParaGratis) +
            "</strong> para el envío gratis.</p>";
        } else {
          barra =
            '<p style="margin:.4rem 0 0;font-size:.88rem;color:var(--verde);font-weight:600">¡Tienes el envío gratis!</p>';
        }

        cont.innerHTML =
          '<div class="carrito-pagina">' +
          "<div><div>" +
          lineas +
          "</div>" +
          '<button class="enlace-eliminar" id="vaciar" style="margin-top:1rem">Vaciar la cesta</button>' +
          "</div>" +
          '<aside class="resumen">' +
          "<h3>Resumen</h3>" +
          '<div class="resumen__fila"><span>Subtotal</span><span>' +
          CR.eur(r.subtotal) +
          "</span></div>" +
          '<div class="resumen__fila"><span>Envío</span><span>' +
          (r.envio === 0 ? "Gratis" : CR.eur(r.envio)) +
          "</span></div>" +
          '<div class="resumen__fila resumen__total"><span>Total</span><span>' +
          CR.eur(r.total) +
          "</span></div>" +
          barra +
          '<a class="btn btn--primario btn--bloque" href="checkout.html" style="margin-top:1rem">Finalizar compra</a>' +
          '<a class="btn btn--linea btn--bloque" href="tienda.html" style="margin-top:.5rem">Seguir comprando</a>' +
          '<p class="texto-apoyo" style="font-size:.78rem;margin-top:.9rem">Pago simulado en esta demo. Impuestos incluidos.</p>' +
          "</aside>" +
          "</div>";

        var v = document.getElementById("vaciar");
        if (v)
          v.addEventListener("click", function () {
            if (confirm("¿Vaciar toda la cesta?")) CRCarrito.vaciar();
          });
      });
    }

    pintar();
    window.addEventListener("cr:carrito", pintar);
  });
})();
