/* =====================================================================
   FACTURADOR 360 · app.js
   ===================================================================== */
"use strict";

const CFG = FACTURADOR_CONFIG;
const $ = (id) => document.getElementById(id);

/* logos precargados por sociedad (para incrustarlos en el PDF) */
const LOGOS = {};
function precargarLogos() {
  Object.entries(CFG.sociedades).forEach(([k, s]) => {
    if (s.logo) {
      const img = new Image();
      img.src = s.logo;
      LOGOS[k] = img;
    }
  });
}

/* ---------- utilidades ---------- */
const eur = (n) =>
  (Number(n) || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function hoyISO(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString().slice(0, 10);
}
function fechaES(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function socActual() {
  return CFG.sociedades[$("sociedad").value];
}
function serieActual() {
  const soc = socActual();
  return $("tipo").value === "rect" ? soc.serieRect : soc.serie;
}
function formatNumero(n) {
  const pad = typeof n === "number" ? String(n).padStart(2, "0") : n;
  return `${serieActual().prefijo}${pad}/${CFG.anioFiscal}`;
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const TRIMESTRES = ["Primer trimestre", "Segundo trimestre", "Tercer trimestre", "Cuarto trimestre"];
const mesDe = (iso) => MESES[Number(iso.slice(5, 7)) - 1];
const trimestreDe = (iso) => TRIMESTRES[Math.floor((Number(iso.slice(5, 7)) - 1) / 3)];

/* ---------- inicialización de selectores ---------- */
function initSociedades() {
  const sel = $("sociedad");
  sel.innerHTML = "";
  // solo sociedades activas aparecen en el selector
  Object.entries(CFG.sociedades)
    .filter(([, s]) => s.activa)
    .forEach(([key, s]) => {
      const o = document.createElement("option");
      o.value = key;
      o.textContent = s.nombre;
      sel.appendChild(o);
    });
  const primera = Object.keys(CFG.sociedades).find((k) => CFG.sociedades[k].activa);
  if (primera) sel.value = primera;
}
function initIva() {
  const sel = $("iva");
  sel.innerHTML = "";
  CFG.tiposIva.forEach((t) => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t + "%";
    sel.appendChild(o);
  });
  sel.value = socActual().ivaPorDefecto;
}
function initClientesFrecuentes() {
  const sel = $("clienteFrecuente");
  sel.querySelectorAll("option:not(:first-child)").forEach((o) => o.remove());
  CFG.clientesFrecuentes.forEach((c, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = c.nombre;
    sel.appendChild(o);
  });
}

/* ---------- emisor (panel lateral) ---------- */
function pintarEmisor() {
  const s = socActual();
  $("emisorNombre").textContent = s.nombre;
  $("emisorDatos").textContent =
    `${s.direccion}\n${s.cpCiudad}\nCIF: ${s.cif}\n${s.email}`;
  $("numeroPreview").textContent = formatNumero("??").replace("??", "??");
}

/* ---------- líneas ---------- */
function nuevaLinea(desc = "", cant = 1, precio = "") {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="col-desc"><input type="text" class="l-desc" value="${desc}" placeholder="Concepto" /></td>
    <td class="col-num"><input type="number" class="l-cant" value="${cant}" min="0" step="any" /></td>
    <td class="col-num"><input type="number" class="l-precio" value="${precio}" min="0" step="any" placeholder="0,00" /></td>
    <td class="line-total">0,00 €</td>
    <td class="col-x"><button type="button" class="btn-x" title="Quitar">×</button></td>`;
  tr.querySelector(".btn-x").addEventListener("click", () => {
    tr.remove();
    recalcular();
  });
  tr.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalcular));
  $("lineasBody").appendChild(tr);
  return tr;
}

function leerLineas() {
  return [...$("lineasBody").querySelectorAll("tr")].map((tr) => {
    const descripcion = tr.querySelector(".l-desc").value.trim();
    const cantidad = Number(tr.querySelector(".l-cant").value) || 0;
    const precio = Number(tr.querySelector(".l-precio").value) || 0;
    return { descripcion, cantidad, precio, total: round2(cantidad * precio), _tr: tr };
  });
}

function recalcular() {
  const lineas = leerLineas();
  let base = 0;
  lineas.forEach((l) => {
    base += l.total;
    l._tr.querySelector(".line-total").textContent = eur(l.total);
  });
  base = round2(base);
  const pct = Number($("iva").value) || 0;
  const ivaImporte = round2(base * (pct / 100));
  const total = round2(base + ivaImporte);
  $("tBase").textContent = eur(base);
  $("tIvaPct").textContent = pct;
  $("tIva").textContent = eur(ivaImporte);
  $("tTotal").textContent = eur(total);
  return { base, pct, ivaImporte, total, lineas };
}

/* ---------- recogida de datos ---------- */
function recogerFactura() {
  const t = recalcular();
  const soc = $("sociedad").value;
  return {
    sociedad: soc,
    tipo: $("tipo").value,
    fecha: $("fecha").value,
    vencimiento: $("vencimiento").value,
    cliente: {
      nombre: $("cliNombre").value.trim(),
      cif: $("cliCif").value.trim(),
      direccion: $("cliDireccion").value.trim(),
      cpCiudad: $("cliCpCiudad").value.trim()
    },
    iva: t.pct,
    base: t.base,
    ivaImporte: t.ivaImporte,
    total: t.total,
    lineas: t.lineas.map((l) => ({ descripcion: l.descripcion, cantidad: l.cantidad, precio: l.precio, total: l.total }))
  };
}

function validar(f) {
  if (!f.cliente.nombre) return "Falta el nombre del cliente.";
  if (!f.cliente.cif) return "Falta el CIF/NIF del cliente.";
  if (!f.lineas.length || f.lineas.every((l) => !l.descripcion || l.total === 0))
    return "Añade al menos una línea con concepto e importe.";
  if (!f.fecha) return "Falta la fecha de la factura.";
  return null;
}

/* ---------- PDF (calcado de la plantilla EM360) ---------- */
function generarPDF(f, numeroStr, { borrador = false } = {}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const s = CFG.sociedades[f.sociedad];
  const M = 18;            // margen
  let y = M;

  // ---- Cabecera: logo (izq) + datos de factura (der) ----
  const logo = LOGOS[f.sociedad];
  let headerBottom = y;
  if (logo && logo.complete && logo.naturalWidth > 0) {
    let w = 38, h = w * (logo.naturalHeight / logo.naturalWidth);
    if (h > 24) { h = 24; w = h * (logo.naturalWidth / logo.naturalHeight); }
    try { doc.addImage(logo, "PNG", M, y, w, h); headerBottom = y + h; } catch (e) {}
  } else {
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(109, 20, 20);
    doc.text(s.nombre, M, y + 6); headerBottom = y + 8;
  }

  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(28, 28, 28);
  doc.text(f.tipo === "rect" ? "RECTIFICATIVA" : "FACTURA", 210 - M, y + 6, { align: "right" });
  const ry = y + 16;
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(74, 74, 74);
  doc.text("Nº de factura:", 138, ry);
  doc.text("Fecha:", 138, ry + 6);
  doc.text("Vencimiento:", 138, ry + 12);
  doc.setFont("helvetica", "bold"); doc.setTextColor(28, 28, 28);
  doc.text(numeroStr, 210 - M, ry, { align: "right" });
  doc.text(fechaES(f.fecha), 210 - M, ry + 6, { align: "right" });
  doc.text(fechaES(f.vencimiento), 210 - M, ry + 12, { align: "right" });

  // ---- Emisor ----
  y = Math.max(headerBottom, ry + 12) + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 28, 28);
  doc.text(s.nombre, M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(74, 74, 74);
  [s.direccion, s.cpCiudad, `CIF: ${s.cif}`, s.email].filter(Boolean).forEach((t, i) => {
    doc.text(t, M, y + 5 + i * 4.5);
  });

  // Cliente
  y += 30;
  doc.setDrawColor(230, 227, 219);
  doc.line(M, y - 4, 210 - M, y - 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(169, 132, 47);
  doc.text("CLIENTE", M, y);
  doc.setTextColor(28, 28, 28);
  doc.setFontSize(10);
  doc.text(f.cliente.nombre, M, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(74, 74, 74);
  doc.setFontSize(9.5);
  [f.cliente.direccion, f.cliente.cpCiudad, f.cliente.cif ? `CIF: ${f.cliente.cif}` : ""]
    .filter(Boolean)
    .forEach((t, i) => doc.text(t, M, y + 11 + i * 4.5));

  // Tabla de líneas
  const body = f.lineas.map((l) => [
    l.descripcion,
    String(l.cantidad),
    eur(l.precio),
    eur(l.total)
  ]);
  doc.autoTable({
    startY: y + 28,
    head: [["Descripción", "Cantidad", "Precio/ud", "Total"]],
    body,
    margin: { left: M, right: M },
    styles: { fontSize: 9.5, cellPadding: 2.5, textColor: [28, 28, 28] },
    headStyles: { fillColor: [28, 28, 28], textColor: [255, 255, 255], halign: "left" },
    columnStyles: { 1: { halign: "right", cellWidth: 22 }, 2: { halign: "right", cellWidth: 30 }, 3: { halign: "right", cellWidth: 30 } }
  });

  // Totales
  let ty = doc.lastAutoTable.finalY + 8;
  const tx = 130;
  doc.setFontSize(10);
  doc.setTextColor(74, 74, 74);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", tx, ty);
  doc.text(eur(f.base), 210 - M, ty, { align: "right" });
  doc.text(`IVA (${f.iva}%)`, tx, ty + 6);
  doc.text(eur(f.ivaImporte), 210 - M, ty + 6, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(28, 28, 28);
  doc.text("TOTAL", tx, ty + 14);
  doc.text(eur(f.total), 210 - M, ty + 14, { align: "right" });

  // Pie: pago + gracias
  let py = ty + 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(74, 74, 74);
  doc.text(`Información de pago: ${s.nombre}. IBAN: ${s.iban}`, M, py);
  doc.setFont("helvetica", "bold");
  doc.text("GRACIAS POR SU CONFIANZA.", M, py + 5);

  // Verifactu-ready: hueco reservado (no activo)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Documento emitido con Facturador 360 · preparado para Verifactu", M, 285);

  // Marca de agua BORRADOR
  if (borrador) {
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(70);
    doc.setFont("helvetica", "bold");
    doc.text("BORRADOR", 105, 160, { align: "center", angle: 30 });
  }

  return doc;
}

function nombreArchivo(soc, numeroStr) {
  return `Factura_${soc}_${numeroStr.replace(/\//g, "-")}.pdf`;
}

/* ---------- backend (Make) ---------- */
async function llamarBackend(payload) {
  if (!CFG.webhookUrl) throw new Error("BACKEND_NO_CONFIGURADO");
  const res = await fetch(CFG.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: CFG.token, ...payload })
  });
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
  if (!res.ok) throw new Error(data && data.error ? data.error : `HTTP ${res.status}`);
  return data;
}

/* carga los clientes frecuentes desde el backend (no van en el repo público) */
async function cargarClientes() {
  if (!CFG.webhookUrl) return;
  try {
    const r = await llamarBackend({ action: "clientes" });
    if (r && r.ok && Array.isArray(r.clientes)) {
      CFG.clientesFrecuentes = r.clientes;
      initClientesFrecuentes();
    }
  } catch (_) { /* silencioso: si falla, cliente manual */ }
}

/* ---------- acciones ---------- */
function setStatus(msg, cls = "info") {
  const el = $("statusMsg");
  el.textContent = msg;
  el.className = "status " + cls;
}

function onPreview() {
  const f = recogerFactura();
  const err = validar(f);
  if (err) return setStatus(err, "err");
  const numeroStr = formatNumero("??").replace("??", "XX");
  const doc = generarPDF(f, numeroStr, { borrador: true });
  doc.output("dataurlnewwindow");
  setStatus("Borrador generado (sin número definitivo).", "info");
}

async function onEmitir() {
  const f = recogerFactura();
  const err = validar(f);
  if (err) return setStatus(err, "err");

  $("btnEmitir").disabled = true;

  if (!CFG.webhookUrl) {
    // Sub-fase 1a: backend aún no conectado -> generamos BORRADOR descargable
    const doc = generarPDF(f, formatNumero("XX"), { borrador: true });
    doc.save(nombreArchivo(f.sociedad, "BORRADOR"));
    setStatus("⚠️ Backend aún no conectado (1b). Generado BORRADOR. La numeración y el archivado automático llegan al conectar Make.", "info");
    $("btnEmitir").disabled = false;
    return;
  }

  try {
    setStatus("Asignando número y registrando…", "info");
    const r = await llamarBackend({
      action: "emitir",
      sociedad: f.sociedad,
      tipo: f.tipo,
      prefijo: serieActual().prefijo,
      anio: CFG.anioFiscal,
      fecha: fechaES(f.fecha),
      trimestre: trimestreDe(f.fecha),
      mes: mesDe(f.fecha),
      base: f.base,
      ivaDecimal: f.iva / 100,
      ivaImporte: f.ivaImporte,
      total: f.total,
      cliente: f.cliente.nombre,
      cif: f.cliente.cif
    });
    if (!r.ok || !r.numero) throw new Error(r.error || "No se recibió número");
    const numeroStr = r.numero;
    $("numeroPreview").textContent = numeroStr;

    const doc = generarPDF(f, numeroStr, { borrador: false });
    const filename = nombreArchivo(f.sociedad, numeroStr);
    doc.save(filename); // copia local de respaldo

    // archivado automático en OneDrive (Invoice Out), best-effort
    let archivado = false;
    try {
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const ra = await llamarBackend({ action: "adjuntar_pdf", filename, pdfBase64 });
      archivado = !!(ra && ra.ok);
    } catch (_) { /* el registro ya está; el PDF queda descargado */ }

    setStatus(
      `✅ Factura ${numeroStr} emitida y registrada.` +
      (archivado ? " PDF archivado en Invoice Out." : " PDF descargado (archívalo a mano; el auto-archivo no respondió)."),
      "ok"
    );
  } catch (e) {
    setStatus("❌ Error: " + e.message + ". No se ha emitido. Reintenta.", "err");
  } finally {
    $("btnEmitir").disabled = false;
  }
}

/* ---------- arranque ---------- */
function init() {
  precargarLogos();
  initSociedades();
  initIva();
  initClientesFrecuentes();
  cargarClientes();
  pintarEmisor();
  $("fecha").value = hoyISO();
  $("vencimiento").value = hoyISO(7);
  nuevaLinea();

  $("sociedad").addEventListener("change", () => { initIva(); pintarEmisor(); });
  $("tipo").addEventListener("change", pintarEmisor);
  $("iva").addEventListener("change", recalcular);
  $("addLinea").addEventListener("click", () => nuevaLinea());
  $("clienteFrecuente").addEventListener("change", (e) => {
    const c = CFG.clientesFrecuentes[e.target.value];
    if (!c) return;
    $("cliNombre").value = c.nombre;
    $("cliCif").value = c.cif;
    if (c.iva != null) { $("iva").value = c.iva; recalcular(); }
  });
  $("btnPreview").addEventListener("click", onPreview);
  $("btnEmitir").addEventListener("click", onEmitir);
  recalcular();
}
document.addEventListener("DOMContentLoaded", init);
