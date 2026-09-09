/* tienda.js — catálogo filtrable. */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var raiz = document.getElementById("listado");
    if (!raiz) return;

    var form = document.getElementById("filtros-form");
    var grid = document.getElementById("resultados-grid");
    var conteo = document.getElementById("resultados-conteo");
    var selOrden = document.getElementById("orden");
    var btnLimpiar = document.getElementById("btn-limpiar");
    var btnToggle = document.getElementById("filtros-toggle");
    var panel = document.getElementById("filtros");
    var titulo = document.getElementById("listado-titulo");

    var todos = [];
    var tallaSel = "";

    CR.productos().then(function (lista) {
      todos = lista;
      poblar(lista);
      aplicarQuery();
      render();
    });

    function poblar(lista) {
      var gGenero = form.querySelector('[data-grupo="genero"]');
      var gCat = form.querySelector('[data-grupo="categoria"]');
      var gMarca = form.querySelector('[data-grupo="marca"]');
      var gAncho = form.querySelector('[data-grupo="ancho"]');
      var gCierre = form.querySelector('[data-grupo="cierre"]');
      radios(gGenero, "genero", CR.valores(lista, "genero"));
      radios(gCat, "categoria", CR.valores(lista, "categoria"), etiquetaCategoria(lista));
      radios(gMarca, "marca", CR.valores(lista, "marca"));
      radios(gAncho, "ancho", CR.valores(lista, "ancho"));
      radios(gCierre, "cierre", CR.valores(lista, "cierre"));

      var chips = form.querySelector('[data-grupo="tallas"]');
      CR.tallasDisponibles(lista).forEach(function (t) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "chip-talla";
        b.textContent = t;
        b.dataset.talla = t;
        b.addEventListener("click", function () {
          tallaSel = tallaSel === String(t) ? "" : String(t);
          chips.querySelectorAll(".chip-talla").forEach(function (x) {
            x.classList.toggle("activa", x.dataset.talla === tallaSel);
          });
          render();
        });
        chips.appendChild(b);
      });
    }

    function radios(cont, name, valores, labels) {
      if (!cont) return;
      labels = labels || {};
      var html = ['<label><input type="radio" name="' + name + '" value="" checked> Todo</label>'];
      valores.forEach(function (v) {
        var t = labels[v] || v.charAt(0).toUpperCase() + v.slice(1);
        html.push(
          '<label><input type="radio" name="' + name + '" value="' + v + '"> ' + t + "</label>"
        );
      });
      cont.innerHTML = html.join("");
    }

    function etiquetaCategoria(lista) {
      var m = {};
      lista.forEach(function (p) {
        if (p.categoria && p.categoria_etiqueta) m[p.categoria] = p.categoria_etiqueta;
      });
      return m;
    }

    function aplicarQuery() {
      var q = CR.leerQuery();
      ["genero", "categoria", "marca", "ancho", "cierre"].forEach(function (k) {
        if (q[k]) {
          var el = form.querySelector('[name="' + k + '"][value="' + q[k] + '"]');
          if (el) el.checked = true;
        }
      });
      if (q.precioMax) form.elements.precioMax.value = q.precioMax;
      if (q.texto) form.elements.texto.value = q.texto;
      if (q.aptoPlantillas) form.elements.aptoPlantillas.checked = true;
      if (q.soloNovedades) form.elements.soloNovedades.checked = true;
      if (q.soloDisponibles) form.elements.soloDisponibles.checked = true;
      if (q.talla) tallaSel = q.talla;
      if (q.orden && selOrden) selOrden.value = q.orden;
    }

    function criterios() {
      var d = new FormData(form);
      return {
        genero: d.get("genero") || "",
        categoria: d.get("categoria") || "",
        marca: d.get("marca") || "",
        ancho: d.get("ancho") || "",
        cierre: d.get("cierre") || "",
        talla: tallaSel,
        precioMax: d.get("precioMax") || "",
        texto: d.get("texto") || "",
        aptoPlantillas: form.elements.aptoPlantillas.checked,
        soloNovedades: form.elements.soloNovedades.checked,
        soloDisponibles: form.elements.soloDisponibles.checked,
      };
    }

    function render() {
      var c = criterios();
      var res = CR.ordenar(CR.filtrar(todos, c), selOrden ? selOrden.value : "");
      conteo.textContent =
        res.length + (res.length === 1 ? " producto" : " productos");
      grid.innerHTML = res.length
        ? res.map(CR.tarjeta).join("")
        : '<div class="sin-resultados"><h3>Sin resultados</h3><p>Prueba a quitar algún filtro.</p></div>';

      if (titulo) {
        var etq = etiquetaCategoria(todos);
        titulo.textContent = c.categoria
          ? etq[c.categoria] || "Productos"
          : c.genero
          ? "Calzado de " + (c.genero === "niño" ? "niño" : c.genero)
          : "Todos los productos";
      }

      var query = {};
      ["genero", "categoria", "marca", "ancho", "cierre", "precioMax", "texto"].forEach(function (k) {
        if (c[k]) query[k] = c[k];
      });
      if (c.talla) query.talla = c.talla;
      if (c.aptoPlantillas) query.aptoPlantillas = "1";
      if (c.soloNovedades) query.soloNovedades = "1";
      if (c.soloDisponibles) query.soloDisponibles = "1";
      if (selOrden && selOrden.value) query.orden = selOrden.value;
      CR.escribirQuery(query);
    }

    form.addEventListener("change", render);
    form.addEventListener("input", function (e) {
      if (e.target.name === "texto" || e.target.name === "precioMax") render();
    });
    if (selOrden) selOrden.addEventListener("change", render);
    if (btnLimpiar)
      btnLimpiar.addEventListener("click", function () {
        form.reset();
        tallaSel = "";
        form.querySelectorAll(".chip-talla").forEach(function (x) {
          x.classList.remove("activa");
        });
        if (selOrden) selOrden.value = "";
        render();
      });
    if (btnToggle && panel)
      btnToggle.addEventListener("click", function () {
        panel.classList.toggle("oculta");
      });
  });
})();
