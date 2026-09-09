/* home.js — portada: destacados y novedades. */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var gDest = document.getElementById("grid-destacados");
    var gNov = document.getElementById("grid-novedades");
    if (!gDest && !gNov) return;

    CR.productos().then(function (lista) {
      if (gDest) {
        var dest = lista
          .filter(function (p) {
            return p.destacado && p.disponible;
          })
          .slice(0, 8);
        if (dest.length < 8) {
          lista.forEach(function (p) {
            if (dest.length < 8 && dest.indexOf(p) === -1 && p.disponible) dest.push(p);
          });
        }
        gDest.innerHTML = dest.map(CR.tarjeta).join("");
      }
      if (gNov) {
        var nov = CR.ordenar(lista, "novedades")
          .filter(function (p) {
            return p.novedad && p.disponible;
          })
          .slice(0, 4);
        gNov.innerHTML = nov.map(CR.tarjeta).join("");
      }
    });
  });
})();
