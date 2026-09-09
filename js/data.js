/* ============================================================
   data.js — acceso al catálogo de productos + utilidades.
   Expone window.CR.
   ============================================================ */

window.CR = (function () {
  "use strict";

  var cache = null;

  function cargar() {
    if (cache) return Promise.resolve(cache);
    if (window.CR_DB && Array.isArray(window.CR_DB.productos)) {
      cache = window.CR_DB;
      return Promise.resolve(cache);
    }
    return fetch("data/productos.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (db) {
        cache = db;
        return db;
      })
      .catch(function (e) {
        console.error("No se pudo cargar el catálogo:", e);
        return { tienda: {}, productos: [] };
      });
  }

  function productos() {
    return cargar().then(function (db) {
      return db.productos || [];
    });
  }

  function porId(id) {
    return productos().then(function (l) {
      return (
        l.filter(function (p) {
          return p.id === id;
        })[0] || null
      );
    });
  }

  /* ---------- Formato ---------- */
  function eur(n) {
    return (
      n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
    );
  }

  function precioHTML(p) {
    return "<strong>" + eur(p.precio) + "</strong>";
  }

  function stockTotal(p) {
    return Object.keys(p.stock || {}).reduce(function (s, t) {
      return s + (p.stock[t] || 0);
    }, 0);
  }

  /* ---------- Filtrado ---------- */
  function filtrar(lista, c) {
    c = c || {};
    return lista.filter(function (p) {
      if (c.genero && p.genero !== c.genero) return false;
      if (c.categoria && p.categoria !== c.categoria) return false;
      if (c.marca && p.marca !== c.marca) return false;
      if (c.talla) {
        if (p.tallas.indexOf(Number(c.talla)) === -1) return false;
        if (!p.stock || !p.stock[c.talla] || p.stock[c.talla] <= 0) return false;
      }
      if (c.precioMax && p.precio > Number(c.precioMax)) return false;
      if (c.ancho && p.ancho !== c.ancho) return false;
      if (c.cierre && p.cierre !== c.cierre) return false;
      if (c.aptoPlantillas && !p.apto_plantillas) return false;
      if (c.soloNovedades && !p.novedad) return false;
      if (c.soloDisponibles && !p.disponible) return false;
      if (c.texto) {
        var q = c.texto.toLowerCase();
        var heno = (
          p.nombre +
          " " +
          p.marca +
          " " +
          p.categoria +
          " " +
          (p.categoria_etiqueta || "") +
          " " +
          p.referencia
        ).toLowerCase();
        if (heno.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function ordenar(lista, modo) {
    var l = lista.slice();
    switch (modo) {
      case "precio-asc":
        return l.sort(function (a, b) {
          return a.precio - b.precio;
        });
      case "precio-desc":
        return l.sort(function (a, b) {
          return b.precio - a.precio;
        });
      case "novedades":
        return l.sort(function (a, b) {
          return a.fecha < b.fecha ? 1 : -1;
        });
      default:
        return l.sort(function (a, b) {
          if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
          return a.fecha < b.fecha ? 1 : -1;
        });
    }
  }

  function valores(lista, campo) {
    var set = {};
    lista.forEach(function (p) {
      set[p[campo]] = true;
    });
    return Object.keys(set).sort();
  }

  function tallasDisponibles(lista) {
    var set = {};
    lista.forEach(function (p) {
      p.tallas.forEach(function (t) {
        set[t] = true;
      });
    });
    return Object.keys(set)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
  }

  /* ---------- Tarjeta de producto ---------- */
  function tarjeta(p) {
    var flags = "";
    if (!p.disponible) flags += '<span class="flag flag--agotado">Agotado</span>';
    else if (p.novedad) flags += '<span class="flag flag--novedad">Novedad</span>';
    if (p.ancho && p.ancho !== "Normal")
      flags +=
        '<span class="flag flag--ancho">' +
        (p.ancho.indexOf("Extra") !== -1 ? "Extra ancho" : "Ancho especial") +
        "</span>";

    var swatches = (p.colores || [])
      .slice(0, 4)
      .map(function (c) {
        return '<span class="swatch" style="background:' + c.hex + '" title="' + c.nombre + '"></span>';
      })
      .join("");

    var fav = window.CRFav ? window.CRFav.boton(p.id) : "";
    var href = "producto.html?id=" + encodeURIComponent(p.id);

    return (
      '<article class="producto">' +
      '<div class="producto__media">' +
      '<a href="' +
      href +
      '"><img src="' +
      p.imagen_principal +
      '" alt="' +
      p.nombre +
      '" loading="lazy" width="500" height="500"></a>' +
      '<span class="producto__flags">' +
      flags +
      "</span>" +
      fav +
      "</div>" +
      '<div class="producto__cuerpo">' +
      '<span class="producto__marca">' +
      p.marca +
      "</span>" +
      '<span class="producto__nombre"><a href="' +
      href +
      '">' +
      p.nombre +
      "</a></span>" +
      (swatches ? '<div class="producto__swatches">' + swatches + "</div>" : "") +
      '<div class="producto__precio">' +
      precioHTML(p) +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  /* ---------- Query string ---------- */
  function leerQuery() {
    var q = {};
    new URLSearchParams(location.search).forEach(function (v, k) {
      if (v !== "") q[k] = v;
    });
    return q;
  }

  function escribirQuery(obj) {
    var params = new URLSearchParams();
    Object.keys(obj).forEach(function (k) {
      if (obj[k] !== "" && obj[k] != null) params.set(k, obj[k]);
    });
    var qs = params.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  return {
    cargar: cargar,
    productos: productos,
    porId: porId,
    eur: eur,
    precioHTML: precioHTML,
    stockTotal: stockTotal,
    filtrar: filtrar,
    ordenar: ordenar,
    valores: valores,
    tallasDisponibles: tallasDisponibles,
    tarjeta: tarjeta,
    leerQuery: leerQuery,
    escribirQuery: escribirQuery,
  };
})();
