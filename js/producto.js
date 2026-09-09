/* producto.js — ficha de producto: galería, talla/color, añadir a la cesta. */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var raiz = document.getElementById("ficha");
    if (!raiz) return;

    var id = CR.leerQuery().id;
    if (!id) {
      raiz.innerHTML = errorHTML();
      return;
    }

    CR.porId(id).then(function (p) {
      if (!p) {
        raiz.innerHTML = errorHTML();
        return;
      }
      pintar(p);
      CR.productos().then(function (l) {
        relacionados(p, l);
      });
    });

    function errorHTML() {
      return (
        '<div class="contenedor sin-resultados"><h1>Producto no encontrado</h1>' +
        '<p>Este artículo ya no está disponible.</p>' +
        '<a class="btn btn--primario" href="tienda.html">Ver la tienda</a></div>'
      );
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    function pintar(p) {
      document.title = p.nombre + " · Calzados Ricardo";
      var estado = { talla: null, color: p.colores[0] ? p.colores[0].nombre : "" };

      var galeria = p.imagenes
        .slice(0, 5)
        .map(function (src, i) {
          return (
            '<img src="' +
            src +
            '" alt="' +
            esc(p.nombre) +
            " — foto " +
            (i + 1) +
            '" loading="' +
            (i === 0 ? "eager" : "lazy") +
            '">'
          );
        })
        .join("");

      var colores = p.colores
        .map(function (c, i) {
          return (
            '<button type="button" class="color-op' +
            (i === 0 ? " activa" : "") +
            '" data-color="' +
            esc(c.nombre) +
            '" style="background:' +
            c.hex +
            '" title="' +
            esc(c.nombre) +
            '" aria-label="Color ' +
            esc(c.nombre) +
            '"></button>'
          );
        })
        .join("");

      var tallas = p.tallas
        .map(function (t) {
          var hay = p.stock && p.stock[t] > 0;
          return (
            '<button type="button" class="talla-op" data-talla="' +
            t +
            '"' +
            (hay ? "" : " disabled") +
            ">" +
            t +
            "</button>"
          );
        })
        .join("");

      var carac = p.caracteristicas
        .map(function (x) {
          return "<li>" + esc(x) + "</li>";
        })
        .join("");

      raiz.innerHTML =
        '<div class="contenedor ficha">' +
        '<p class="ficha__migas"><a href="index.html">Inicio</a> · <a href="tienda.html?genero=' +
        encodeURIComponent(p.genero) +
        '">' +
        cap(p.genero) +
        "</a> · " +
        esc(p.categoria) +
        "</p>" +
        '<div class="ficha__cols">' +
        '<div class="ficha__galeria">' +
        galeria +
        "</div>" +
        '<div class="ficha__panel">' +
        '<span class="marca">' +
        esc(p.marca) +
        "</span>" +
        "<h1>" +
        esc(p.nombre) +
        "</h1>" +
        '<div class="ficha__precio">' +
        CR.precioHTML(p) +
        "</div>" +
        '<div class="selector">' +
        '<div class="selector__label"><span>Color: <b id="color-nombre">' +
        esc(estado.color) +
        "</b></span></div>" +
        '<div class="selector__colores">' +
        colores +
        "</div></div>" +
        '<div class="selector">' +
        '<div class="selector__label"><span>Talla</span><a href="envios-devoluciones.html#tallas">Guía de tallas</a></div>' +
        '<div class="selector__tallas">' +
        tallas +
        "</div></div>" +
        '<p class="aviso-linea" id="aviso"></p>' +
        '<div class="ficha__acciones">' +
        '<button class="btn btn--primario btn--bloque" id="btn-add"' +
        (p.disponible ? "" : " disabled") +
        ">" +
        (p.disponible ? "Añadir a la cesta" : "Agotado") +
        "</button>" +
        (window.CRFav ? window.CRFav.boton(p.id).replace('class="fav-btn', 'class="fav-btn ficha-fav') : "") +
        "</div>" +
        '<div class="ficha__acordeon">' +
        "<details open><summary>Descripción</summary><div><p>" +
        esc(p.descripcion) +
        "</p></div></details>" +
        "<details><summary>Características</summary><div><ul class=\"lista-check\">" +
        carac +
        "</ul></div></details>" +
        "<details><summary>Envío y devoluciones</summary><div><p>Envío en 24–72 h. Gratis a partir de 60 €. " +
        "Dispones de 30 días para cambiar la talla o devolver el producto. " +
        '<a href="envios-devoluciones.html">Más información</a>.</p></div></details>' +
        "</div>" +
        "</div>" +
        "</div>" +
        '<section class="seccion"><h2>También te puede gustar</h2><div class="rejilla" id="rel-grid"></div></section>' +
        "</div>";

      // Galería / visor
      var visor = document.getElementById("visor");
      raiz.querySelectorAll(".ficha__galeria img").forEach(function (img) {
        img.addEventListener("click", function () {
          if (!visor) return;
          visor.querySelector("img").src = img.src;
          visor.classList.add("abierto");
        });
      });
      if (visor)
        visor.addEventListener("click", function () {
          visor.classList.remove("abierto");
        });

      // Color
      raiz.querySelectorAll(".color-op").forEach(function (b) {
        b.addEventListener("click", function () {
          raiz.querySelectorAll(".color-op").forEach(function (x) {
            x.classList.remove("activa");
          });
          b.classList.add("activa");
          estado.color = b.getAttribute("data-color");
          document.getElementById("color-nombre").textContent = estado.color;
        });
      });

      // Talla
      raiz.querySelectorAll(".talla-op").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.disabled) return;
          raiz.querySelectorAll(".talla-op").forEach(function (x) {
            x.classList.remove("activa");
          });
          b.classList.add("activa");
          estado.talla = b.getAttribute("data-talla");
          document.getElementById("aviso").textContent = "";
        });
      });

      // Añadir a la cesta
      var btnAdd = document.getElementById("btn-add");
      if (btnAdd)
        btnAdd.addEventListener("click", function () {
          if (!estado.talla) {
            document.getElementById("aviso").textContent = "Elige una talla.";
            return;
          }
          window.CRCarrito.anadir(p.id, estado.talla, estado.color, 1);
          if (window.CRLayout) window.CRLayout.abrirCesta();
        });
    }

    function relacionados(p, lista) {
      var cont = document.getElementById("rel-grid");
      if (!cont) return;
      var rel = lista
        .filter(function (o) {
          return o.id !== p.id && o.genero === p.genero && (o.categoria === p.categoria || o.marca === p.marca);
        })
        .slice(0, 4);
      if (rel.length < 4)
        lista.forEach(function (o) {
          if (rel.length < 4 && o.id !== p.id && rel.indexOf(o) === -1 && o.genero === p.genero) rel.push(o);
        });
      cont.innerHTML = rel.map(CR.tarjeta).join("");
    }

    function cap(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  });
})();
