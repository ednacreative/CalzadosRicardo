/* ============================================================
   layout.js — cabecera, pie, panel lateral del carrito, menú móvil.
   No usa fetch para el HTML: funciona también con doble clic.
   ============================================================ */

(function () {
  "use strict";

  var NOMBRE = "Calzados Ricardo";

  var NAV = [
    { href: "tienda.html?genero=hombre", txt: "Hombre" },
    { href: "tienda.html?genero=mujer", txt: "Mujer" },
    { href: "tienda.html?genero=ni%C3%B1o", txt: "Niño" },
    { href: "tienda.html?soloRebajas=1", txt: "Rebajas" },
    { href: "tienda.html", txt: "Toda la tienda" },
    { href: "nosotros.html", txt: "La tienda" },
  ];

  var actual = location.pathname.split("/").pop() || "index.html";
  if (actual === "") actual = "index.html";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function eur(n) {
    return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }

  var IC_BUSCAR =
    '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
  var IC_FAV =
    '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5 8.6 5 10 6.2 12 8c2-1.8 3.4-3 5.5-3C21 5 23 8.5 21.5 12 19 16.5 12 21 12 21Z"/></svg>';
  var IC_CESTA =
    '<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

  function cabeceraHTML() {
    var enlaces = NAV.map(function (n) {
      var base = n.href.split("?")[0];
      var activo = base === actual && location.search.indexOf(n.href.split("?")[1] || "@@") !== -1
        ? ' aria-current="page"'
        : "";
      return '<a href="' + n.href + '"' + activo + ">" + n.txt + "</a>";
    }).join("");

    return (
      '<div class="cinta">Envío gratis a partir de 60 € · Cambios y devoluciones en 30 días</div>' +
      '<div class="contenedor cabecera__inner">' +
      '<a class="cabecera__logo" href="index.html" aria-label="' +
      NOMBRE +
      '"><img src="assets/logo.svg" alt="' +
      NOMBRE +
      '" width="260" height="44"></a>' +
      '<button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false"><span></span></button>' +
      '<nav class="nav" id="nav-principal">' +
      enlaces +
      "</nav>" +
      '<div class="cabecera__acciones">' +
      '<a class="icono-btn" href="tienda.html" aria-label="Buscar en la tienda">' +
      IC_BUSCAR +
      "</a>" +
      '<a class="icono-btn" href="favoritos.html" aria-label="Favoritos">' +
      IC_FAV +
      '<span class="icono-btn__num" id="fav-num" hidden></span></a>' +
      '<button class="icono-btn" id="btn-cesta" aria-label="Abrir cesta">' +
      IC_CESTA +
      '<span class="icono-btn__num" id="cesta-num" hidden></span></button>' +
      "</div>" +
      "</div>"
    );
  }

  function pieHTML() {
    var anio = new Date().getFullYear();
    return (
      '<div class="contenedor">' +
      '<div class="pie__grid">' +
      "<div>" +
      '<img class="pie__logo" src="assets/logo.svg" alt="' +
      NOMBRE +
      '" width="260" height="44">' +
      "<p>Zapaterías en Zaragoza desde 1986. Calzado de marca para toda la familia, con asesoramiento de verdad.</p>" +
      "</div>" +
      "<div><h4>Tienda</h4><ul>" +
      '<li><a href="tienda.html?genero=hombre">Hombre</a></li>' +
      '<li><a href="tienda.html?genero=mujer">Mujer</a></li>' +
      '<li><a href="tienda.html?genero=ni%C3%B1o">Niño</a></li>' +
      '<li><a href="tienda.html?soloRebajas=1">Rebajas</a></li>' +
      '<li><a href="favoritos.html">Mis favoritos</a></li>' +
      "</ul></div>" +
      "<div><h4>Ayuda</h4><ul>" +
      '<li><a href="envios-devoluciones.html">Envíos y devoluciones</a></li>' +
      '<li><a href="envios-devoluciones.html#tallas">Guía de tallas</a></li>' +
      '<li><a href="contacto.html">Contacto</a></li>' +
      '<li><a href="nosotros.html">Sobre la tienda</a></li>' +
      "</ul></div>" +
      "<div><h4>Contacto</h4><ul>" +
      '<li><a href="tel:+34976000000">976 000 000</a></li>' +
      '<li><a href="mailto:hola@calzadosricardo.es">hola@calzadosricardo.es</a></li>' +
      "<li>Calle de Alfonso I, 18<br>50003 Zaragoza</li>" +
      "<li>L–S 10:00–20:30</li>" +
      "</ul></div>" +
      "</div>" +
      '<div class="pie__legal">' +
      "<span>© " +
      anio +
      " " +
      NOMBRE +
      ". Todos los derechos reservados.</span>" +
      "<span>Aviso legal · Privacidad · Cookies · Condiciones de compra</span>" +
      "</div>" +
      "</div>"
    );
  }

  function drawerHTML() {
    return (
      '<div class="drawer-fondo" id="drawer-fondo"></div>' +
      '<aside class="drawer" id="drawer" aria-label="Cesta de la compra">' +
      '<div class="drawer__cab"><h3>Tu cesta</h3><button class="drawer__x" id="drawer-x" aria-label="Cerrar">&times;</button></div>' +
      '<div class="drawer__lineas" id="drawer-lineas"></div>' +
      '<div class="drawer__pie" id="drawer-pie" hidden>' +
      '<div class="drawer__total"><span>Subtotal</span><span id="drawer-subtotal">—</span></div>' +
      '<a class="btn btn--linea btn--bloque" href="carrito.html" style="margin-bottom:.5rem">Ver la cesta</a>' +
      '<a class="btn btn--primario btn--bloque" href="checkout.html">Finalizar compra</a>' +
      "</div></aside>"
    );
  }

  /* ---------- Respaldo de imágenes ---------- */
  document.addEventListener(
    "error",
    function (e) {
      var img = e.target;
      if (
        img &&
        img.tagName === "IMG" &&
        !img.dataset.fb &&
        !/picsum\.photos/.test(img.src) &&
        /^https?:/.test(img.src)
      ) {
        img.dataset.fb = "1";
        img.src = "https://picsum.photos/seed/cr-" + Math.abs(hash(img.src)) + "/800/800";
      }
    },
    true
  );
  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  /* ---------- Contadores ---------- */
  function refrescarContadores() {
    var fn = document.getElementById("fav-num");
    if (fn && window.CRFav) {
      var f = window.CRFav.total();
      fn.textContent = f;
      fn.hidden = f === 0;
    }
    var cn = document.getElementById("cesta-num");
    if (cn && window.CRCarrito) {
      var c = window.CRCarrito.numArticulos();
      cn.textContent = c;
      cn.hidden = c === 0;
    }
  }

  /* ---------- Drawer ---------- */
  function pintarDrawer() {
    var cont = document.getElementById("drawer-lineas");
    var pie = document.getElementById("drawer-pie");
    if (!cont || !window.CRCarrito) return;
    window.CRCarrito.resolver().then(function (r) {
      if (!r || !r.lineas.length) {
        cont.innerHTML =
          '<div class="carrito-vacio"><p>Tu cesta está vacía.</p>' +
          '<a class="btn btn--primario" href="tienda.html">Ver productos</a></div>';
        if (pie) pie.hidden = true;
        return;
      }
      cont.innerHTML = r.lineas.map(lineaHTML).join("");
      if (pie) {
        pie.hidden = false;
        var st = document.getElementById("drawer-subtotal");
        if (st) st.textContent = eur(r.subtotal);
      }
    });
  }

  function lineaHTML(l) {
    return (
      '<div class="linea-carrito">' +
      '<img src="' +
      l.producto.imagen_principal +
      '" alt="' +
      esc(l.producto.nombre) +
      '">' +
      '<div class="linea-carrito__info">' +
      "<strong>" +
      esc(l.producto.nombre) +
      "</strong>" +
      "<span>Talla " +
      l.talla +
      (l.color ? " · " + esc(l.color) : "") +
      "</span>" +
      '<div class="cant">' +
      '<button data-cant="-1" data-clave="' +
      esc(l.clave) +
      '" aria-label="Quitar una unidad">−</button>' +
      "<span>" +
      l.cant +
      "</span>" +
      '<button data-cant="1" data-clave="' +
      esc(l.clave) +
      '" aria-label="Añadir una unidad">+</button>' +
      "</div>" +
      '<button class="enlace-eliminar" data-quitar="' +
      esc(l.clave) +
      '">Eliminar</button>' +
      "</div>" +
      '<div class="linea-carrito__precio">' +
      eur(l.subtotal) +
      "</div>" +
      "</div>"
    );
  }

  function abrirDrawer() {
    document.getElementById("drawer-fondo").classList.add("abierto");
    document.getElementById("drawer").classList.add("abierto");
    document.body.style.overflow = "hidden";
    pintarDrawer();
  }
  function cerrarDrawer() {
    document.getElementById("drawer-fondo").classList.remove("abierto");
    document.getElementById("drawer").classList.remove("abierto");
    document.body.style.overflow = "";
  }

  function montar() {
    var header = document.querySelector("[data-cabecera]");
    if (header) {
      header.className = "cabecera";
      header.innerHTML = cabeceraHTML();
    }
    var footer = document.querySelector("[data-pie]");
    if (footer) {
      footer.className = "pie";
      footer.innerHTML = pieHTML();
    }
    if (!document.getElementById("drawer")) {
      document.body.insertAdjacentHTML("beforeend", drawerHTML());
    }

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var ab = nav.classList.toggle("abierta");
        toggle.setAttribute("aria-expanded", ab ? "true" : "false");
      });
      nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A") nav.classList.remove("abierta");
      });
    }

    var btnCesta = document.getElementById("btn-cesta");
    if (btnCesta) btnCesta.addEventListener("click", abrirDrawer);
    var dx = document.getElementById("drawer-x");
    if (dx) dx.addEventListener("click", cerrarDrawer);
    var df = document.getElementById("drawer-fondo");
    if (df) df.addEventListener("click", cerrarDrawer);

    // Delegación global
    document.addEventListener("click", function (e) {
      var fav = e.target.closest && e.target.closest("[data-fav]");
      if (fav) {
        e.preventDefault();
        if (window.CRFav) {
          var m = window.CRFav.alternar(fav.getAttribute("data-fav"));
          fav.classList.toggle("activo", m);
          fav.setAttribute("aria-pressed", m);
        }
        return;
      }
      var cant = e.target.closest && e.target.closest("[data-cant]");
      if (cant && window.CRCarrito) {
        window.CRCarrito.cambiarCant(
          cant.getAttribute("data-clave"),
          Number(cant.getAttribute("data-cant"))
        );
        return;
      }
      var quitar = e.target.closest && e.target.closest("[data-quitar]");
      if (quitar && window.CRCarrito) {
        window.CRCarrito.eliminar(quitar.getAttribute("data-quitar"));
        return;
      }
    });

    window.addEventListener("cr:favoritos", function () {
      refrescarContadores();
      document.querySelectorAll("[data-fav]").forEach(function (b) {
        var m = window.CRFav.tiene(b.getAttribute("data-fav"));
        b.classList.toggle("activo", m);
        b.setAttribute("aria-pressed", m);
      });
    });
    window.addEventListener("cr:carrito", function () {
      refrescarContadores();
      if (document.getElementById("drawer").classList.contains("abierto")) pintarDrawer();
    });

    // API para que otras páginas abran la cesta al añadir
    window.CRLayout = { abrirCesta: abrirDrawer, cerrarCesta: cerrarDrawer };

    refrescarContadores();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
