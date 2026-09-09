/* ============================================================
   forms.js — envío de formularios por email con FormSubmit.co.

   Sin backend. La PRIMERA vez que se envía un formulario, FormSubmit
   manda un correo de activación al destinatario; hay que pulsar
   "Activate Form" una sola vez. Los envíos anteriores no se reenvían.
   ============================================================ */

window.CRForms = (function () {
  "use strict";

  var DESTINO = "edna.creativestudio@gmail.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + encodeURIComponent(DESTINO);

  function enviar(datos, opciones) {
    opciones = opciones || {};

    if (location.protocol === "file:") {
      return Promise.reject(
        new Error(
          "El envío no funciona abriendo el archivo con doble clic. Usa la web publicada o «npm run dev»."
        )
      );
    }

    var cuerpo = {
      _subject: opciones.asunto || "Nuevo mensaje · Calzados Ricardo",
      _template: opciones.plantilla || "box",
      _captcha: "false",
    };
    if (opciones.replyTo) cuerpo._replyto = opciones.replyTo;
    if (opciones.autorespuesta) cuerpo._autoresponse = opciones.autorespuesta;
    Object.keys(datos).forEach(function (k) {
      cuerpo[k] = datos[k];
    });

    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(cuerpo),
    }).then(function (r) {
      return r
        .json()
        .catch(function () {
          return {};
        })
        .then(function (j) {
          if (r.ok && j && String(j.success) === "true") return j;
          var orig = (j && j.message) || "";
          var msg = orig || "No se ha podido enviar en este momento.";
          if (/activat/i.test(orig)) {
            msg =
              "El formulario está pendiente de activar: se ha enviado un correo con un enlace " +
              '"Activate Form" a ' +
              DESTINO +
              " (revisa también spam). Al pulsarlo quedará operativo.";
          }
          throw new Error(msg);
        });
    });
  }

  return { enviar: enviar, destino: DESTINO };
})();
