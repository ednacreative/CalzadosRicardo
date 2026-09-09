/* checkout.js — datos de envío + resumen + envío del pedido por email. */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var raiz = document.getElementById("checkout-cont");
    if (!raiz) return;

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    CRCarrito.resolver().then(function (r) {
      if (!r || !r.lineas.length) {
        raiz.innerHTML =
          '<div class="carrito-vacio"><h2>No hay nada que comprar</h2>' +
          '<a class="btn btn--primario" href="tienda.html">Ir a la tienda</a></div>';
        return;
      }
      pintar(r);
    });

    function resumenLineas(r) {
      return r.lineas
        .map(function (l) {
          return (
            '<div class="resumen__fila"><span>' +
            l.cant +
            "× " +
            esc(l.producto.nombre) +
            " <span style=\"color:var(--gris-500)\">(T " +
            l.talla +
            (l.color ? " · " + esc(l.color) : "") +
            ")</span></span><span>" +
            CR.eur(l.subtotal) +
            "</span></div>"
          );
        })
        .join("");
    }

    function pintar(r) {
      raiz.innerHTML =
        '<div class="checkout">' +
        "<div>" +
        '<form id="form-checkout">' +
        "<h2>Datos de contacto</h2>" +
        '<div class="form-grid">' +
        campo("nombre", "Nombre y apellidos", "text", true) +
        campo("email", "Email", "email", true) +
        campo("telefono", "Teléfono", "tel", true) +
        "</div>" +
        "<h2 style=\"margin-top:1.5rem\">Entrega</h2>" +
        '<div class="form-campo"><label for="c-entrega">Método</label>' +
        '<select id="c-entrega" name="entrega"><option value="envio">Envío a domicilio</option>' +
        '<option value="tienda">Recogida en tienda (Calle de Alfonso I, 18)</option></select></div>' +
        '<div class="form-grid" id="dir-envio">' +
        campo("direccion", "Dirección", "text", true) +
        campo("cp", "Código postal", "text", true) +
        campo("ciudad", "Ciudad", "text", true) +
        campo("provincia", "Provincia", "text", true) +
        "</div>" +
        '<div class="form-campo ancho-total"><label for="c-notas">Notas para el pedido (opcional)</label>' +
        '<textarea id="c-notas" name="notas"></textarea></div>' +
        '<label style="display:flex;gap:.5rem;font-size:.85rem;color:var(--tinta-70);margin:.4rem 0 1rem">' +
        '<input type="checkbox" required> He leído y acepto las condiciones de compra y la política de privacidad.</label>' +
        '<button class="btn btn--primario btn--bloque" type="submit">Realizar pedido</button>' +
        '<div id="ck-error" class="aviso-error oculto"></div>' +
        "</form>" +
        "</div>" +
        '<aside class="resumen">' +
        "<h3>Tu pedido</h3>" +
        resumenLineas(r) +
        '<div class="resumen__fila" style="border-top:1px solid var(--gris-200);margin-top:.6rem;padding-top:.6rem"><span>Subtotal</span><span>' +
        CR.eur(r.subtotal) +
        "</span></div>" +
        '<div class="resumen__fila"><span>Envío</span><span>' +
        (r.envio === 0 ? "Gratis" : CR.eur(r.envio)) +
        "</span></div>" +
        '<div class="resumen__fila resumen__total"><span>Total</span><span>' +
        CR.eur(r.total) +
        "</span></div>" +
        '<p class="texto-apoyo" style="font-size:.78rem;margin-top:.8rem">Demo: no se cobra nada. El pedido se envía por email a la tienda para gestionarlo. La pasarela de pago real se añade en la Fase 2.</p>' +
        "</aside>" +
        "</div>";

      var form = document.getElementById("form-checkout");
      var selEntrega = document.getElementById("c-entrega");
      var dirEnvio = document.getElementById("dir-envio");
      selEntrega.addEventListener("change", function () {
        var tienda = selEntrega.value === "tienda";
        dirEnvio.style.display = tienda ? "none" : "";
        dirEnvio.querySelectorAll("input").forEach(function (i) {
          i.required = !tienda;
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = "Enviando pedido…";
        var err = document.getElementById("ck-error");
        err.classList.add("oculto");

        var f = form;
        var lineasTxt = r.lineas
          .map(function (l, i) {
            return (
              String(i + 1).padStart(2, "0") +
              ". " +
              l.cant +
              "× " +
              l.producto.nombre +
              " · " +
              l.producto.marca +
              " · Talla " +
              l.talla +
              (l.color ? " · " + l.color : "") +
              " · " +
              l.producto.referencia +
              " · " +
              CR.eur(l.subtotal)
            );
          })
          .join("\n");

        var datos = {
          "01. Cliente": f.nombre.value,
          "02. Email": f.email.value,
          "03. Teléfono": f.telefono.value,
          "04. Entrega": selEntrega.value === "tienda" ? "Recogida en tienda" : "Envío a domicilio",
        };
        if (selEntrega.value !== "tienda") {
          datos["05. Dirección"] =
            f.direccion.value + ", " + f.cp.value + " " + f.ciudad.value + " (" + f.provincia.value + ")";
        }
        datos["06. Artículos"] = "\n" + lineasTxt;
        datos["07. Subtotal"] = CR.eur(r.subtotal);
        datos["08. Envío"] = r.envio === 0 ? "Gratis" : CR.eur(r.envio);
        datos["09. TOTAL"] = CR.eur(r.total);
        if (f.notas.value) datos["10. Notas"] = f.notas.value;

        var fin = function () {
          btn.disabled = false;
          btn.textContent = "Realizar pedido";
        };

        var exito = function () {
          CRCarrito.vaciar();
          raiz.innerHTML =
            '<div class="aviso-ok" style="max-width:620px;margin:0 auto;text-align:center">' +
            "<h2 style=\"color:#1e5738\">¡Pedido recibido!</h2>" +
            "<p>Gracias, " +
            esc(f.nombre.value) +
            ". Hemos enviado tu pedido a la tienda y te confirmaremos por email (" +
            esc(f.email.value) +
            ") la disponibilidad y el pago.</p>" +
            '<a class="btn btn--primario" href="index.html">Volver al inicio</a></div>';
          window.scrollTo({ top: 0, behavior: "smooth" });
        };

        if (!window.CRForms) {
          fin();
          exito();
          return;
        }

        window.CRForms
          .enviar(datos, {
            asunto: "🛒 Nuevo pedido web — " + CR.eur(r.total) + " · " + f.nombre.value,
            replyTo: f.email.value,
            autorespuesta:
              "Hola " +
              f.nombre.value +
              ",\n\nHemos recibido tu pedido en Calzados Ricardo por un total de " +
              CR.eur(r.total) +
              ". Te confirmaremos por email la disponibilidad y la forma de pago.\n\n" +
              "Gracias por tu compra.\nCalzados Ricardo · 976 000 000",
          })
          .then(exito)
          .catch(function (e2) {
            fin();
            err.textContent =
              (e2 && e2.message ? e2.message + " " : "") +
              "Escríbenos a hola@calzadosricardo.es o llámanos al 976 000 000.";
            err.classList.remove("oculto");
          });
      });
    }

    function campo(name, label, tipo, req) {
      return (
        '<div class="form-campo"><label for="c-' +
        name +
        '">' +
        label +
        (req ? " *" : "") +
        "</label>" +
        '<input id="c-' +
        name +
        '" name="' +
        name +
        '" type="' +
        tipo +
        '"' +
        (req ? " required" : "") +
        "></div>"
      );
    }
  });
})();
