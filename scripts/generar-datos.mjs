/**
 * Generador del catálogo ficticio de Calzados Ricardo.
 *
 * Calzados Ricardo (Zaragoza, desde 1925) está especializada en CALZADO
 * ESPECIAL: confort, pies anchos y juanetes, apto para plantillas
 * ortopédicas, zuecos de trabajo (sanitario / hostelería), calzado de
 * vestir y calzado de casa.
 *
 * Uso:  node scripts/generar-datos.mjs
 * Salida: data/productos.json  y  data/productos.js (window.CR_DB)
 *
 * Datos y marcas inventados. Imágenes: placeholders de Unsplash (pool
 * FOTOS), con respaldo a picsum.photos si alguna falla.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

/* ---------- PRNG determinista ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260909);
const pick = (a) => a[Math.floor(rand() * a.length)];
const intBetween = (min, max) => Math.floor(min + rand() * (max - min + 1));
const between = (min, max) => min + rand() * (max - min);
const chance = (p) => rand() < p;
const round2 = (n) => Math.round(n * 100) / 100;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Catálogos ---------- */
const MARCAS = ["Ricardo", "Doria", "Anatómic", "PieLibre", "Sanícalz", "Duvalí", "Confortan"];

// familia: { categoria (slug), etiqueta, peso, generos, precio, tallas, cierres }
const FAMILIAS = [
  {
    categoria: "confort",
    etiqueta: "Zapato confort",
    peso: 0.24,
    generos: ["hombre", "mujer"],
    precio: [55, 130],
    cierres: ["Velcro", "Cordones", "Elástico", "Sin cierre"],
  },
  {
    categoria: "pies-anchos",
    etiqueta: "Zapato para pies anchos",
    peso: 0.18,
    generos: ["hombre", "mujer"],
    precio: [60, 140],
    cierres: ["Velcro", "Cordones", "Elástico"],
  },
  {
    categoria: "vestir",
    etiqueta: "Zapato de vestir",
    peso: 0.14,
    generos: ["hombre", "mujer"],
    precio: [70, 155],
    cierres: ["Cordones", "Hebilla", "Sin cierre"],
  },
  {
    categoria: "zueco-trabajo",
    etiqueta: "Zueco de trabajo",
    peso: 0.14,
    generos: ["unisex"],
    precio: [30, 75],
    cierres: ["Sin cierre", "Correa trasera"],
  },
  {
    categoria: "casa",
    etiqueta: "Zapatilla de casa",
    peso: 0.1,
    generos: ["hombre", "mujer"],
    precio: [22, 48],
    cierres: ["Sin cierre", "Velcro"],
  },
  {
    categoria: "botin-confort",
    etiqueta: "Botín confort",
    peso: 0.09,
    generos: ["hombre", "mujer"],
    precio: [75, 160],
    cierres: ["Cremallera", "Cordones", "Elástico"],
  },
  {
    categoria: "sandalia-anatomica",
    etiqueta: "Sandalia anatómica",
    peso: 0.07,
    generos: ["hombre", "mujer"],
    precio: [35, 95],
    cierres: ["Hebilla", "Velcro"],
  },
  {
    categoria: "deportivo-confort",
    etiqueta: "Deportivo de paseo",
    peso: 0.04,
    generos: ["hombre", "mujer", "unisex"],
    precio: [50, 110],
    cierres: ["Cordones", "Velcro", "Elástico"],
  },
];

const ANCHOS = [
  { v: "Normal", peso: 0.4 },
  { v: "Ancho especial (F)", peso: 0.4 },
  { v: "Extra ancho (H)", peso: 0.2 },
];

const COLORES = [
  { nombre: "Negro", hex: "#1a1a1a" },
  { nombre: "Marrón", hex: "#6b4a2b" },
  { nombre: "Cuero", hex: "#b5854f" },
  { nombre: "Azul marino", hex: "#20304a" },
  { nombre: "Gris", hex: "#8a8f96" },
  { nombre: "Beige", hex: "#c9b79c" },
  { nombre: "Burdeos", hex: "#5c2233" },
  { nombre: "Blanco", hex: "#f2f2ef" },
  { nombre: "Camel", hex: "#a9793f" },
];

const MATERIALES = [
  "Piel flor",
  "Serraje",
  "Nobuk",
  "Piel grabada",
  "Piel lavable",
  "Textil elástico",
  "Neopreno",
  "Piel vegana",
  "EVA inyectada",
];

const NOMBRES = {
  confort: ["cordón elástico", "velcro doble", "sin costuras", "empeine alto", "ligero", "extensible"],
  "pies-anchos": ["horma extra ancha", "para juanetes", "empeine regulable", "velcro adaptable", "sin puntera rígida"],
  vestir: ["cordón liso", "hebilla", "blucher", "salón forrado", "cosido a mano"],
  "zueco-trabajo": ["sanitario", "antideslizante SRC", "hostelería", "cerrado", "ventilado", "autoclavable"],
  casa: ["cerrada de estar por casa", "abierta con talón", "botín de casa", "con suela reforzada", "de rizo"],
  "botin-confort": ["con cremallera", "elásticos laterales", "forro cálido", "impermeable", "acordonado"],
  "sandalia-anatomica": ["dos tiras", "pala cruzada", "con puntera cerrada", "de dedo", "cuña anatómica"],
  "deportivo-confort": ["ultraligero", "para caminar", "plantilla memory", "malla transpirable", "sin cordones"],
};

/* ---------- Imágenes (pool de Unsplash verificado) ---------- */
const FOTOS = [
  "1449505278894-297fdb3edbc1",
  "1533867617858-e7b97e060509",
  "1531310197839-ccf54634509e",
  "1582897085656-c636d006a246",
  "1560343090-f0409e92791a",
  "1520639888713-7851133b1ed0",
  "1549298916-b41d501d3772",
  "1603487742131-4160ec999306",
  "1543508282-6319a3e2621f",
  "1491553895911-0055eca6402d",
  "1525966222134-fcfa99b8ae77",
];

function hashCadena(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function urlFoto(id) {
  return `https://images.unsplash.com/photo-${id}?w=1000&h=1000&fit=crop&q=72`;
}
function fotosDe(id, n) {
  const pool = FOTOS.slice();
  let seed = hashCadena(id);
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n).map(urlFoto);
}

/* ---------- Ponderaciones ---------- */
function ponderado(arr, campoPeso) {
  const total = arr.reduce((s, x) => s + x[campoPeso], 0);
  let r = rand() * total;
  for (const x of arr) if ((r -= x[campoPeso]) <= 0) return x;
  return arr[0];
}

function tallasPara(genero) {
  if (genero === "hombre") return rango(39, 47);
  if (genero === "mujer") return rango(35, 43);
  if (genero === "niño") return rango(24, 34);
  return rango(36, 46); // unisex
}
function rango(a, b) {
  const r = [];
  for (let i = a; i <= b; i++) r.push(i);
  return r;
}

/* ---------- Generación ---------- */
const TOTAL = 40;
const productos = [];

for (let i = 1; i <= TOTAL; i++) {
  const id = `CR-${String(i).padStart(4, "0")}`;
  const fam = ponderado(FAMILIAS, "peso");
  const genero = pick(fam.generos);
  const marca = pick(MARCAS);
  const detalle = pick(NOMBRES[fam.categoria]);
  const ancho = fam.categoria === "pies-anchos" ? pick(["Ancho especial (F)", "Extra ancho (H)"]) : ponderado(ANCHOS, "peso").v;
  const cierre = pick(fam.cierres);
  const material = pick(MATERIALES);

  const precio = round2(between(fam.precio[0], fam.precio[1]) * (marca === "Ricardo" ? 0.93 : 1));

  const tallas = tallasPara(genero);
  const stock = {};
  tallas.forEach((t) => {
    stock[t] = chance(0.14) ? 0 : intBetween(1, 10);
  });

  const nColores = intBetween(1, 3);
  const colores = [...COLORES]
    .sort(() => rand() - 0.5)
    .slice(0, nColores)
    .map((c) => ({ nombre: c.nombre, hex: c.hex }));

  const plantillaExtraible = chance(0.7);
  const aptoPlantillas = plantillaExtraible ? chance(0.85) : chance(0.2);
  const sinCosturas = fam.categoria === "confort" || fam.categoria === "pies-anchos" ? chance(0.6) : chance(0.15);

  const imagenes = fotosDe(id, intBetween(3, 4));

  var titulo = fam.etiqueta + " " + detalle;
  titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);

  const caract = [
    "Corte de " + material.toLowerCase(),
    plantillaExtraible ? "Plantilla extraíble" : "Plantilla fija acolchada",
    aptoPlantillas ? "Apto para plantillas ortopédicas" : "Plantilla anatómica de serie",
    "Piso flexible y ligero",
    "Cierre: " + cierre.toLowerCase(),
  ];
  if (ancho !== "Normal") caract.push("Horma de " + ancho.toLowerCase());
  if (sinCosturas) caract.push("Interior sin costuras");
  if (fam.categoria === "zueco-trabajo") caract.push("Suela antideslizante certificada SRC", "Fácil de limpiar");
  if (fam.categoria === "botin-confort") caract.push("Caña acolchada");
  if (fam.categoria === "sandalia-anatomica") caract.push("Lecho plantar anatómico");

  const descripcion =
    titulo +
    " de " +
    marca +
    ". " +
    (fam.categoria === "pies-anchos"
      ? "Diseñado para pies anchos, juanetes y dedos en garra: sin costuras que rocen y con empeine que se adapta. "
      : fam.categoria === "zueco-trabajo"
      ? "Pensado para estar de pie muchas horas: ligero, antideslizante y fácil de limpiar. "
      : fam.categoria === "casa"
      ? "Para estar cómodo en casa sin renunciar a la sujeción. "
      : "Comodidad desde el primer día, sin periodo de adaptación. ") +
    (aptoPlantillas ? "Admite tu plantilla ortopédica retirando la de serie. " : "") +
    "Horma " +
    ancho.toLowerCase() +
    ". Disponible en " +
    colores.map((c) => c.nombre.toLowerCase()).join(", ") +
    ". Si dudas con la talla o el ancho, escríbenos antes de pedir.";

  const p = {
    id,
    referencia: id,
    nombre: titulo,
    marca,
    genero,
    categoria: fam.categoria,
    categoria_etiqueta: fam.etiqueta,
    precio,
    precio_texto: precio.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €",
    destacado: chance(0.25),
    novedad: chance(0.3),
    ancho,
    cierre,
    plantilla_extraible: plantillaExtraible,
    apto_plantillas: aptoPlantillas,
    sin_costuras: sinCosturas,
    material,
    colores,
    tallas,
    stock,
    disponible: Object.values(stock).some((n) => n > 0),
    descripcion,
    caracteristicas: caract,
    imagenes,
    imagen_principal: imagenes[0],
    fecha: new Date(2026, intBetween(0, 8), intBetween(1, 28)).toISOString().slice(0, 10),
  };
  productos.push(p);
}

productos.sort((a, b) => {
  if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
  return a.fecha < b.fecha ? 1 : -1;
});

const salida = {
  generado: new Date().toISOString(),
  fuente: "datos ficticios — generar-datos.mjs",
  tienda: {
    nombre: "Calzados Ricardo",
    ciudad: "Zaragoza",
    fundada: 1925,
    direccion: "Coso 109, 50001 Zaragoza",
    telefono: "876 011 809",
    whatsapp: "+34 656 429 687",
    instagram: "@calzados.ricardo",
    email_pedidos: "edna.creativestudio@gmail.com",
    envio_gratis_desde: 60,
    coste_envio: 3.95,
  },
  marcas: MARCAS,
  categorias: FAMILIAS.map((f) => ({ slug: f.categoria, etiqueta: f.etiqueta })),
  total: productos.length,
  productos,
};

mkdirSync(resolve(raiz, "data"), { recursive: true });
const json = JSON.stringify(salida, null, 2);
writeFileSync(resolve(raiz, "data", "productos.json"), json + "\n", "utf8");
writeFileSync(
  resolve(raiz, "data", "productos.js"),
  "/* Generado por scripts/generar-datos.mjs — no editar a mano. */\n" +
    "window.CR_DB = " +
    json +
    ";\n",
  "utf8"
);

const porGenero = productos.reduce((a, p) => ((a[p.genero] = (a[p.genero] || 0) + 1), a), {});
const porCat = productos.reduce((a, p) => ((a[p.categoria] = (a[p.categoria] || 0) + 1), a), {});
console.log(
  "OK  " + productos.length + " productos -> data/productos.json + data/productos.js\n" +
    "    géneros: " + JSON.stringify(porGenero) + "\n" +
    "    categorías: " + JSON.stringify(porCat) + "\n" +
    "    " + productos.filter((p) => p.ancho !== "Normal").length + " de ancho especial · " +
    productos.filter((p) => p.apto_plantillas).length + " aptos para plantillas"
);
