/* ============================================================
   carrito.js — carrito de la compra (localStorage, por navegador).

   Guarda solo referencias: [{ id, talla, color, cant }]. Los precios y
   datos del producto se resuelven contra el catálogo (js/data.js).
   En la Fase 2 (pasarela de pago real) esto se conecta con el backend.
   ============================================================ */

window.CRCarrito = (function () {
  "use strict";

  var CLAVE = "cr_carrito";
  var oyentes = [];

  function leer() {
    try {
      var v = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function guardar(lineas) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lineas));
    } catch (e) {}
    oyentes.forEach(function (cb) {
      try {
        cb(lineas);
      } catch (e) {}
    });
    window.dispatchEvent(new CustomEvent("cr:carrito", { detail: lineas }));
  }

  function clave(l) {
    return [l.id, l.talla, l.color || ""].join("|");
  }

  return {
    lineas: leer,

    numArticulos: function () {
      return leer().reduce(function (n, l) {
        return n + l.cant;
      }, 0);
    },

    anadir: function (id, talla, color, cant) {
      cant = cant || 1;
      var lineas = leer();
      var k = clave({ id: id, talla: talla, color: color });
      var existe = lineas.filter(function (l) {
        return clave(l) === k;
      })[0];
      if (existe) existe.cant += cant;
      else lineas.push({ id: id, talla: talla, color: color || "", cant: cant });
      guardar(lineas);
    },

    fijarCant: function (k, n) {
      var lineas = leer();
      lineas.forEach(function (l) {
        if (clave(l) === k) l.cant = Math.max(1, n);
      });
      guardar(lineas);
    },

    cambiarCant: function (k, delta) {
      var lineas = leer()
        .map(function (l) {
          if (clave(l) === k) l.cant += delta;
          return l;
        })
        .filter(function (l) {
          return l.cant > 0;
        });
      guardar(lineas);
    },

    eliminar: function (k) {
      guardar(
        leer().filter(function (l) {
          return clave(l) !== k;
        })
      );
    },

    vaciar: function () {
      guardar([]);
    },

    claveDe: clave,

    /** Devuelve una promesa con las líneas enriquecidas + totales. */
    resolver: function () {
      if (!window.CR || !window.CR.cargar) return Promise.resolve(null);
      return window.CR.cargar().then(function (db) {
        var porId = {};
        (db.productos || []).forEach(function (p) {
          porId[p.id] = p;
        });
        var lineas = leer()
          .map(function (l) {
            var p = porId[l.id];
            if (!p) return null;
            return {
              clave: clave(l),
              id: l.id,
              talla: l.talla,
              color: l.color,
              cant: l.cant,
              producto: p,
              precioUnidad: p.precio,
              subtotal: Math.round(p.precio * l.cant * 100) / 100,
            };
          })
          .filter(Boolean);

        var envioGratisDesde = (db.tienda && db.tienda.envio_gratis_desde) || 60;
        var costeEnvio = (db.tienda && db.tienda.coste_envio) || 3.95;
        var subtotal = Math.round(
          lineas.reduce(function (s, l) {
            return s + l.subtotal;
          }, 0) * 100
        ) / 100;
        var envio = lineas.length === 0 || subtotal >= envioGratisDesde ? 0 : costeEnvio;
        return {
          lineas: lineas,
          subtotal: subtotal,
          envio: envio,
          total: Math.round((subtotal + envio) * 100) / 100,
          envioGratisDesde: envioGratisDesde,
          faltaParaGratis: Math.max(0, Math.round((envioGratisDesde - subtotal) * 100) / 100),
        };
      });
    },

    onCambio: function (cb) {
      if (typeof cb === "function") oyentes.push(cb);
    },
  };
})();
