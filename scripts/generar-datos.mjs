/**
 * Generador del catálogo de productos ficticios de Calzados Ricardo.
 *
 * Uso:  node scripts/generar-datos.mjs
 * Salida: data/productos.json  y  data/productos.js (window.CR_DB)
 *
 * Todo es inventado: marcas, modelos, precios y stock. Las imágenes son
 * placeholders de Unsplash (pool FOTOS más abajo). Sustituye el pool —o el
 * JSON directamente— por el catálogo real cuando toque.
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
const MARCAS = ["Ricardo", "Vento", "Kestrel", "Maresía", "Nordwalk", "Pisa 21", "Lumen"];

const FAMILIAS = {
  hombre: [
    { categoria: "zapato de vestir", peso: 0.18, base: [70, 140], tallas: [39, 46] },
    { categoria: "zapatillas", peso: 0.28, base: [45, 110], tallas: [39, 46] },
    { categoria: "botas", peso: 0.16, base: [80, 160], tallas: [39, 46] },
    { categoria: "mocasines", peso: 0.12, base: [60, 120], tallas: [39, 46] },
    { categoria: "náuticos", peso: 0.1, base: [55, 95], tallas: [39, 46] },
    { categoria: "casual", peso: 0.16, base: [40, 85], tallas: [39, 46] },
  ],
  mujer: [
    { categoria: "zapatillas", peso: 0.3, base: [45, 115], tallas: [35, 42] },
    { categoria: "botines", peso: 0.2, base: [65, 140], tallas: [35, 42] },
    { categoria: "sandalias", peso: 0.16, base: [35, 90], tallas: [35, 42] },
    { categoria: "bailarinas", peso: 0.12, base: [40, 85], tallas: [35, 42] },
    { categoria: "botas", peso: 0.12, base: [80, 170], tallas: [35, 42] },
    { categoria: "tacón", peso: 0.1, base: [55, 120], tallas: [35, 42] },
  ],
  niño: [
    { categoria: "zapatillas", peso: 0.5, base: [30, 65], tallas: [28, 38] },
    { categoria: "deportivo", peso: 0.25, base: [32, 60], tallas: [28, 38] },
    { categoria: "botas", peso: 0.15, base: [38, 70], tallas: [28, 38] },
    { categoria: "sandalias", peso: 0.1, base: [22, 45], tallas: [24, 34] },
  ],
};

const COLORES = [
  { nombre: "Negro", hex: "#1a1a1a" },
  { nombre: "Blanco", hex: "#f2f2ef" },
  { nombre: "Marrón", hex: "#6b4a2b" },
  { nombre: "Cuero", hex: "#b5854f" },
  { nombre: "Azul marino", hex: "#20304a" },
  { nombre: "Gris", hex: "#8a8f96" },
  { nombre: "Beige", hex: "#c9b79c" },
  { nombre: "Verde oliva", hex: "#5b5f43" },
  { nombre: "Burdeos", hex: "#5c2233" },
  { nombre: "Rojo", hex: "#b12a2a" },
];

const MATERIALES = [
  "Piel flor",
  "Serraje",
  "Nobuk",
  "Ante",
  "Piel grabada",
  "Malla técnica",
  "Lona",
  "Piel vegana",
  "Textil reciclado",
];

const NOMBRES = {
  "zapato de vestir": ["Oxford", "Derby", "Blucher", "Monkstrap", "Cordón liso"],
  zapatillas: ["Runner", "Court", "Retro", "Urban", "Trail", "Knit", "Classic 80"],
  botas: ["Chelsea", "Chukka", "Trekking", "Militar", "Biker", "Serraje alta"],
  botines: ["Chelsea", "Tacón ancho", "Cowboy", "Track", "Elástico", "Plataforma"],
  mocasines: ["Penny", "Antifaz", "Borlas", "Náutico premium"],
  náuticos: ["Clásico", "Dos ojales", "Cordón náutico"],
  casual: ["Blucher casual", "Sneaker piel", "Zapato confort", "Slip-on"],
  sandalias: ["Tira ancha", "Cangrejera", "Pala cruzada", "Menorquina", "Cuña esparto"],
  bailarinas: ["Punta redonda", "Lazo", "Destalonada", "Manoletina"],
  tacón: ["Salón", "Destalonado", "Pulsera", "Kitten heel"],
  deportivo: ["Velcro run", "Luces", "Fútbol sala", "Escolar deportivo"],
};

/* ---------- Imágenes (pool de Unsplash, verificar antes de usar) ---------- */
const FOTOS = [
  "1542291026-7eec264c27ff",
  "1600185365483-26d7a4cc7519",
  "1595950653106-6c9ebd614d3a",
  "1608231387042-66d1773070a5",
  "1549298916-b41d501d3772",
  "1600269452121-4f2416e55c28",
  "1584735175315-9d5df23860e6",
  "1491553895911-0055eca6402d",
  "1465479423260-c4afc24172c6",
  "1520639888713-7851133b1ed0",
  "1560769629-975ec94e6a86",
  "1520256862855-398228c41684",
  "1543163521-1bf539c55dd2",
  "1525966222134-fcfa99b8ae77",
  "1595341888016-a392ef81b7de",
  "1605348532760-6753d2c43329",
  "1552346154-21d32810aba3",
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

/* ---------- Generación ---------- */
function familiaPonderada(genero) {
  const fam = FAMILIAS[genero];
  const total = fam.reduce((s, f) => s + f.peso, 0);
  let r = rand() * total;
  for (const f of fam) if ((r -= f.peso) <= 0) return f;
  return fam[0];
}

const TOTAL = 40;
const productos = [];

for (let i = 1; i <= TOTAL; i++) {
  const id = `CR-${String(i).padStart(4, "0")}`;
  const genero = pick(["hombre", "hombre", "mujer", "mujer", "mujer", "niño"]);
  const fam = familiaPonderada(genero);
  const marca = pick(MARCAS);
  const modelo = pick(NOMBRES[fam.categoria] || ["Modelo"]);

  const precio = round2(between(fam.base[0], fam.base[1]) * (marca === "Ricardo" ? 0.92 : 1));
  const enRebaja = chance(0.22);
  const precioAntes = enRebaja ? round2(precio * between(1.2, 1.55)) : null;

  // Tallas y stock
  const [tMin, tMax] = fam.tallas;
  const tallas = [];
  for (let t = tMin; t <= tMax; t++) tallas.push(t);
  const stock = {};
  tallas.forEach((t) => {
    stock[t] = chance(0.16) ? 0 : intBetween(1, 12);
  });

  // Colores
  const nColores = intBetween(1, 3);
  const colores = [...COLORES]
    .sort(() => rand() - 0.5)
    .slice(0, nColores)
    .map((c) => ({ nombre: c.nombre, hex: c.hex }));

  const material = pick(MATERIALES);
  const imagenes = fotosDe(id, intBetween(3, 5));

  const caracteristicas = [
    `Corte de ${material.toLowerCase()}`,
    pick(["Suela de goma antideslizante", "Suela EVA ligera", "Suela de cuero con antideslizante", "Suela track"]),
    pick(["Plantilla acolchada extraíble", "Plantilla de látex", "Plantilla transpirable"]),
    pick(["Forro textil", "Forro de piel", "Forro sin costuras"]),
  ];
  if (fam.categoria === "zapatillas" || fam.categoria === "deportivo")
    caracteristicas.push("Cierre de cordones", "Refuerzo en talón");
  if (fam.categoria === "botas" || fam.categoria === "botines")
    caracteristicas.push(chance(0.5) ? "Cierre con cremallera interior" : "Elásticos laterales");

  const nombre = `${modelo} ${fam.categoria === "zapatillas" ? "" : ""}`.trim();
  const titulo = `${cap(fam.categoria)} ${modelo}`.replace("  ", " ");

  const p = {
    id,
    referencia: id,
    nombre: titulo,
    marca,
    genero,
    categoria: fam.categoria,
    precio,
    precio_antes: precioAntes,
    en_rebaja: enRebaja,
    destacado: chance(0.25),
    novedad: chance(0.3),
    colores,
    tallas,
    stock,
    disponible: Object.values(stock).some((n) => n > 0),
    material,
    descripcion:
      `${titulo} de ${marca}. ${cap(material)} de primera calidad para un uso ` +
      `${genero === "niño" ? "diario en el cole y el recreo" : "diario con buen acabado"}. ` +
      `Horma ${pick(["estándar", "ancha", "cómoda"])}; si dudas entre dos tallas, ` +
      `te recomendamos ${pick(["la más grande", "tu talla habitual"])}. ` +
      `Disponible en ${colores.map((c) => c.nombre.toLowerCase()).join(", ")}.`,
    caracteristicas,
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
    email_pedidos: "edna.creativestudio@gmail.com",
    envio_gratis_desde: 60,
    coste_envio: 3.95,
  },
  marcas: MARCAS,
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
console.log(
  `OK  ${productos.length} productos -> data/productos.json + data/productos.js\n` +
    `    ${JSON.stringify(porGenero)}\n` +
    `    ${productos.filter((p) => p.en_rebaja).length} en rebaja · ` +
    `${productos.filter((p) => p.novedad).length} novedades`
);
