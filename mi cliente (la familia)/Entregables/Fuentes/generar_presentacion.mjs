import fs from "node:fs/promises";
import path from "node:path";
import {
  Presentation,
  PresentationFile,
  layers,
  shape,
  table,
  text,
} from "@oai/artifact-tool";

const PROJECT_ROOT = process.env.PROJECT_ROOT;
if (!PROJECT_ROOT) throw new Error("Defina PROJECT_ROOT con la raíz del repositorio.");

const OUTPUT_PPTX = process.env.OUTPUT_PPTX || path.join(
  PROJECT_ROOT,
  "mi cliente (la familia)",
  "Entregables",
  "13_Presentacion_Ejecutiva_Tiendita_Maday.pptx",
);
const PREVIEW_DIR = process.env.PREVIEW_DIR || path.join(path.dirname(OUTPUT_PPTX), "preview");
const LAYOUT_DIR = process.env.LAYOUT_DIR || path.join(path.dirname(OUTPUT_PPTX), "layout");

const CAPTURES = path.join(
  PROJECT_ROOT,
  "mi cliente (la familia)",
  "Entregables",
  "Fuentes",
  "capturas",
);

const C = {
  ink: "#101010",
  muted: "#5E646B",
  panel: "#F1F2F0",
  rule: "#B8BCC4",
  green: "#205B3A",
  greenSoft: "#E7F0E9",
  amber: "#F0A51B",
  amberSoft: "#FFF1D8",
  red: "#B84A3A",
  redSoft: "#F8E8E4",
  blue: "#3D8DFF",
  blueSoft: "#EAF5FB",
  white: "#FFFFFF",
};

const FONT = "Arial";
const W = 1280;
const H = 720;
const REVISION = "b61259d · 16 jul 2026";

function tx(name, content, left, top, width, height, opts = {}) {
  return text([content], {
    name,
    position: { left, top },
    width,
    height,
    style: {
      fontSize: `${opts.fontSize ?? 20}px`,
      typeface: FONT,
      color: opts.color ?? C.ink,
      bold: opts.bold ?? false,
      alignment: opts.alignment ?? "left",
      verticalAlignment: opts.verticalAlignment ?? "top",
      autoFit: opts.autoFit ?? "none",
      wrap: "square",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  });
}

function rect(name, left, top, width, height, fill = C.panel, lineFill = fill, radius = false) {
  return shape({
    name,
    geometry: radius ? "roundRect" : "rect",
    fill,
    line: { style: "solid", width: lineFill === "none" ? 0 : 1, fill: lineFill },
    position: { left, top },
    width,
    height,
  });
}

function line(name, left, top, width, height = 0, fill = C.rule, weight = 2) {
  return shape({
    name,
    geometry: "straightConnector1",
    fill: "none",
    line: { style: "solid", width: weight, fill },
    position: { left, top },
    width,
    height: Math.max(0.03, Math.abs(height)),
  });
}

function circle(name, left, top, diameter, fill) {
  return shape({
    name,
    geometry: "ellipse",
    fill,
    line: { style: "solid", width: 0, fill },
    position: { left, top },
    width: diameter,
    height: diameter,
  });
}

function chrome(number) {
  return [
    tx(`revision-${number}`, REVISION, 42, 676, 260, 18, { fontSize: 12, color: C.muted }),
    tx(`page-${number}`, String(number).padStart(2, "0"), 1190, 676, 48, 18, {
      fontSize: 12,
      color: C.muted,
      alignment: "right",
    }),
  ];
}

function addSlide(title, number, children = [], options = {}) {
  const slide = presentation.slides.add();
  slide.background.fill = C.white;
  slide.compose(
    layers({ name: `tiendita-slide-${number}`, width: "fill", height: "fill" }, [
      tx(`title-${number}`, title, 42, 32, 1196, options.titleHeight ?? 76, {
        fontSize: options.titleSize ?? 42,
        bold: true,
        autoFit: "shrinkText",
      }),
      line(`title-rule-${number}`, 42, options.ruleTop ?? 112, 1196, 0, C.rule, 1),
      ...children,
      ...chrome(number),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 1 },
  );
  return slide;
}

async function imageBytes(fileName) {
  const bytes = await fs.readFile(path.join(CAPTURES, fileName));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function addScreenshot(slide, fileName, position, alt, fit = "contain") {
  slide.images.add({
    blob: await imageBytes(fileName),
    contentType: "image/png",
    alt,
    fit,
    position,
  });
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// 01 — portada: adaptación del layout Codex Grid 08.
{
  const slide = presentation.slides.add();
  slide.background.fill = C.white;
  slide.compose(
    layers({ name: "tiendita-cover", width: "fill", height: "fill" }, [
      rect("cover-accent", 0, 0, 18, H, C.green, C.green),
      tx("cover-eyebrow", "PRESENTACIÓN EJECUTIVA · FASE SHD", 58, 52, 520, 28, {
        fontSize: 16,
        bold: true,
        color: C.green,
      }),
      tx("cover-title", "Tiendita Maday", 58, 136, 560, 92, {
        fontSize: 64,
        bold: true,
      }),
      tx("cover-subtitle", "Operación integrada para La Familia", 58, 244, 520, 72, {
        fontSize: 30,
        color: C.muted,
      }),
      tx(
        "cover-message",
        "Una aplicación funcional para compra, caja, inventario, administración y control del negocio.",
        58,
        350,
        510,
        112,
        { fontSize: 22 },
      ),
      tx("cover-meta", "Demo funcional · arquitectura · Git · pruebas · resultados", 58, 548, 540, 52, {
        fontSize: 17,
        color: C.green,
        bold: true,
      }),
      rect("cover-image-frame", 652, 70, 586, 510, C.panel, C.rule, true),
      tx("cover-caption", "Panel administrativo con datos de demostración", 676, 598, 530, 24, {
        fontSize: 14,
        color: C.muted,
        alignment: "center",
      }),
      ...chrome(1),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 1 },
  );
  await addScreenshot(
    slide,
    "40_admin_dashboard.png",
    { left: 668, top: 120, width: 554, height: 410 },
    "Panel de control de Tiendita Maday",
  );
}

// 02 — problema/solución: adaptación del layout 11.
addSlide("El problema no era vender: era controlar la operación completa", 2, [
  tx(
    "problem-intro",
    "La Familia necesitaba reunir procesos que normalmente quedan separados entre mostrador, inventario y administración.",
    42,
    142,
    1196,
    70,
    { fontSize: 23 },
  ),
  rect("before-panel", 42, 256, 572, 180, C.panel, C.panel, true),
  rect("after-panel", 666, 256, 572, 180, C.greenSoft, C.greenSoft, true),
  tx("before-title", "Antes: información fragmentada", 74, 286, 510, 40, { fontSize: 28, bold: true }),
  tx(
    "before-body",
    "• Ventas sin vínculo directo con stock\n• Cortes y ajustes difíciles de auditar\n• Roles, pedidos y proveedores dispersos",
    74,
    344,
    500,
    110,
    { fontSize: 19 },
  ),
  tx("after-title", "Con Tiendita Maday: un solo registro", 698, 286, 510, 40, {
    fontSize: 28,
    bold: true,
    color: C.green,
  }),
  tx(
    "after-body",
    "• Compra, POS e inventario conectados\n• Permisos por rol y trazabilidad\n• Paneles para decidir con evidencia",
    698,
    344,
    500,
    110,
    { fontSize: 19 },
  ),
  tx(
    "problem-takeaway",
    "Resultado esperado: menos captura duplicada, mayor control y una base técnica que puede escalar.",
    42,
    500,
    1196,
    72,
    { fontSize: 26, bold: true, color: C.green, alignment: "center" },
  ),
]);

// 03 — alcance funcional: adaptación del layout 13.
addSlide("Cinco perfiles participan en un mismo flujo de negocio", 3, [
  rect("scope-client", 42, 154, 560, 180, C.panel, C.panel),
  rect("scope-pos", 636, 154, 602, 180, C.panel, C.panel),
  rect("scope-stock", 42, 372, 560, 180, C.panel, C.panel),
  rect("scope-admin", 636, 372, 602, 180, C.panel, C.panel),
  tx("scope-client-title", "Cliente", 70, 180, 500, 34, { fontSize: 28, bold: true, color: C.green }),
  tx("scope-client-body", "Catálogo · carrito · checkout · entrega/recolección · pedidos · perfil", 70, 232, 500, 72, {
    fontSize: 19,
  }),
  tx("scope-pos-title", "Caja", 664, 180, 540, 34, { fontSize: 28, bold: true, color: C.green }),
  tx("scope-pos-body", "Apertura · venta · efectivo/tarjeta · cambio · consulta · corte", 664, 232, 540, 72, {
    fontSize: 19,
  }),
  tx("scope-stock-title", "Almacén", 70, 398, 500, 34, { fontSize: 28, bold: true, color: C.green }),
  tx("scope-stock-body", "Existencias · código de barras · entradas/salidas · historial auditable", 70, 450, 500, 72, {
    fontSize: 19,
  }),
  tx("scope-admin-title", "Gerencia y administración", 664, 398, 540, 34, {
    fontSize: 28,
    bold: true,
    color: C.green,
  }),
  tx(
    "scope-admin-body",
    "Productos · usuarios · pedidos · abasto · caducidades · promociones · finanzas · configuración",
    664,
    450,
    540,
    78,
    { fontSize: 19 },
  ),
  tx("scope-note", "El rol de gerente hereda gestión administrativa; los privilegios de propietario siguen restringidos.", 42, 590, 1196, 32, {
    fontSize: 17,
    color: C.muted,
    alignment: "center",
  }),
]);

// 04 — recorrido de demostración: adaptación del layout 17.
addSlide("La demostración recorre una operación de principio a fin", 4, [
  line("demo-timeline", 84, 330, 1080, 0, C.ink, 2),
  circle("demo-dot-1", 78, 323, 14, C.green),
  circle("demo-dot-2", 624, 323, 14, C.green),
  circle("demo-dot-3", 1152, 323, 14, C.green),
  tx("demo-date-1", "01 · PREPARAR", 76, 276, 230, 28, { fontSize: 18, bold: true, color: C.green }),
  tx("demo-date-2", "02 · OPERAR", 622, 276, 230, 28, { fontSize: 18, bold: true, color: C.green }),
  tx("demo-date-3", "03 · COMPROBAR", 998, 276, 230, 28, {
    fontSize: 18,
    bold: true,
    color: C.green,
    alignment: "right",
  }),
  tx("demo-title-1", "CRUD y acceso", 76, 370, 320, 40, { fontSize: 28, bold: true }),
  tx("demo-body-1", "Alta de usuario/producto\nConsulta y modificación\nDesactivación controlada", 76, 426, 320, 118, {
    fontSize: 19,
  }),
  tx("demo-title-2", "Flujo funcional", 470, 370, 340, 40, { fontSize: 28, bold: true }),
  tx("demo-body-2", "Compra cliente\nVenta POS y cambio\nEntrada de inventario", 470, 426, 340, 118, { fontSize: 19 }),
  tx("demo-title-3", "Evidencia y errores", 876, 370, 340, 40, { fontSize: 28, bold: true }),
  tx("demo-body-3", "Validaciones de campos\nPermisos y mensajes\nReportes, caja y auditoría", 876, 426, 340, 118, {
    fontSize: 19,
  }),
  tx(
    "demo-note",
    "Datos de demostración preparados; no usar pagos live ni credenciales de producción.",
    42,
    590,
    1196,
    30,
    { fontSize: 17, color: C.red, alignment: "center", bold: true },
  ),
]);

// 05 — evidencia cliente.
{
  const slide = addSlide("El checkout valida disponibilidad, entrega y pago", 5, [
    rect("client-frame-1", 42, 154, 570, 410, C.panel, C.rule, true),
    rect("client-frame-2", 668, 154, 570, 410, C.panel, C.rule, true),
    tx("client-label-1", "Explorar y seleccionar", 42, 586, 570, 26, {
      fontSize: 18,
      bold: true,
      color: C.green,
      alignment: "center",
    }),
    tx("client-label-2", "Identificar, dirigir, enviar y pagar", 668, 586, 570, 26, {
      fontSize: 18,
      bold: true,
      color: C.green,
      alignment: "center",
    }),
  ]);
  await addScreenshot(slide, "10_cliente_inicio.png", { left: 56, top: 170, width: 542, height: 378 }, "Inicio del cliente");
  await addScreenshot(slide, "13_cliente_checkout.png", { left: 682, top: 170, width: 542, height: 378 }, "Checkout del cliente");
}

// 06 — evidencia POS e inventario.
{
  const slide = addSlide("Caja e inventario comparten trazabilidad operativa", 6, [
    rect("pos-frame", 42, 154, 570, 410, C.panel, C.rule, true),
    rect("stock-frame", 668, 154, 570, 410, C.panel, C.rule, true),
    tx("pos-label", "Venta POS: total, método y confirmación", 42, 586, 570, 26, {
      fontSize: 18,
      bold: true,
      color: C.green,
      alignment: "center",
    }),
    tx("stock-label", "Movimiento: antes/después, motivo y responsable", 668, 586, 570, 26, {
      fontSize: 18,
      bold: true,
      color: C.green,
      alignment: "center",
    }),
  ]);
  await addScreenshot(slide, "22_cajero_venta.png", { left: 56, top: 170, width: 542, height: 378 }, "Punto de venta");
  await addScreenshot(slide, "32_almacen_movimientos.png", { left: 682, top: 170, width: 542, height: 378 }, "Historial de inventario");
}

// 07 — administración, CRUD y reportes: adaptación del layout 08.
{
  const slide = addSlide("El panel administrativo reúne CRUD, reportes y controles", 7, [
    rect("admin-frame", 42, 150, 742, 470, C.panel, C.rule, true),
    tx("admin-1", "ALTA", 830, 174, 140, 28, { fontSize: 18, bold: true, color: C.green }),
    tx("admin-1b", "Nuevo producto, usuario, proveedor, orden o promoción.", 830, 210, 370, 58, { fontSize: 18 }),
    tx("admin-2", "MODIFICAR Y CONSULTAR", 830, 294, 280, 28, { fontSize: 18, bold: true, color: C.green }),
    tx("admin-2b", "Filtros, edición, estados y detalle por módulo.", 830, 330, 370, 58, { fontSize: 18 }),
    tx("admin-3", "ELIMINAR / DESACTIVAR", 830, 414, 300, 28, { fontSize: 18, bold: true, color: C.green }),
    tx("admin-3b", "Acciones controladas; la trazabilidad histórica se conserva.", 830, 450, 370, 62, { fontSize: 18 }),
    tx("admin-4", "REPORTAR", 830, 538, 180, 28, { fontSize: 18, bold: true, color: C.green }),
    tx("admin-4b", "Dashboard, ventas/corte, movimientos, pedidos y finanzas.", 830, 574, 370, 44, { fontSize: 18 }),
  ]);
  await addScreenshot(slide, "41_admin_productos.png", { left: 58, top: 168, width: 710, height: 438 }, "Administración de productos");
}

// 08 — arquitectura con conectores antes que nodos.
addSlide("La arquitectura separa experiencia, reglas y datos", 8, [
  tx("arch-intro", "La separación permite mantener permisos y reglas críticas en el servidor, no en la interfaz.", 42, 136, 1196, 48, {
    fontSize: 21,
    color: C.muted,
  }),
  line("arch-link-1", 206, 340, 96, 0, C.green, 4),
  line("arch-link-2", 446, 340, 96, 0, C.green, 4),
  line("arch-link-3", 686, 340, 96, 0, C.green, 4),
  line("arch-link-4", 926, 340, 96, 0, C.green, 4),
  rect("arch-users", 42, 252, 164, 176, C.panel, C.panel, true),
  rect("arch-ui", 302, 252, 144, 176, C.blueSoft, C.blueSoft, true),
  rect("arch-api", 542, 252, 144, 176, C.greenSoft, C.greenSoft, true),
  rect("arch-db", 782, 252, 144, 176, C.amberSoft, C.amberSoft, true),
  rect("arch-ext", 1022, 252, 216, 176, C.panel, C.panel, true),
  tx("arch-users-title", "Personas", 58, 278, 132, 34, { fontSize: 24, bold: true, alignment: "center" }),
  tx("arch-users-body", "cliente\ncajero\nalmacén\ngerencia\nadmin", 58, 326, 132, 92, {
    fontSize: 17,
    alignment: "center",
  }),
  tx("arch-ui-title", "Angular 21", 316, 284, 116, 34, { fontSize: 23, bold: true, alignment: "center" }),
  tx("arch-ui-body", "PWA\nresponsive\nRBAC visible", 316, 338, 116, 74, { fontSize: 17, alignment: "center" }),
  tx("arch-api-title", "Express 4", 556, 284, 116, 34, { fontSize: 23, bold: true, alignment: "center" }),
  tx("arch-api-body", "API REST\nreglas\ntransacciones", 556, 338, 116, 74, { fontSize: 17, alignment: "center" }),
  tx("arch-db-title", "PostgreSQL", 794, 284, 120, 34, { fontSize: 18, bold: true, alignment: "center" }),
  tx("arch-db-body", "33 entidades\nmigraciones\nauditoría", 794, 338, 120, 74, { fontSize: 17, alignment: "center" }),
  tx("arch-ext-title", "Servicios externos", 1038, 284, 184, 34, { fontSize: 22, bold: true, alignment: "center" }),
  tx("arch-ext-body", "Google · PayPal\nCloudinary · correo\nOpenAPI", 1038, 338, 184, 74, { fontSize: 17, alignment: "center" }),
  rect("arch-security", 174, 504, 932, 78, C.green, C.green, true),
  tx("arch-security-text", "JWT + roles + CORS + validación de servidor + transacciones", 198, 526, 884, 32, {
    fontSize: 24,
    bold: true,
    color: C.white,
    alignment: "center",
  }),
]);

// 09 — base de datos y servicios: adaptación del layout 14.
addSlide("El modelo de datos cubre seis dominios operativos", 9, [
  tx("data-intro", "Fuente técnica: schema.mmd, init.sql y migraciones. La API se documenta en /api-docs.", 42, 132, 1196, 38, {
    fontSize: 20,
    color: C.muted,
  }),
  table({
    name: "domain-table",
    rows: 7,
    columns: 4,
    values: [
      ["Dominio", "Datos principales", "Proceso", "Control"],
      ["Identidad", "usuarios · sesiones · empleados", "acceso y roles", "JWT / RBAC"],
      ["Catálogo", "productos · categorías · precios", "consulta y CRUD", "validación"],
      ["Ventas", "pedidos · partidas · reseñas", "checkout y POS", "transacción"],
      ["Abasto", "proveedores · órdenes · lotes", "recepción", "trazabilidad"],
      ["Operación", "caja · gastos · notificaciones", "corte y control", "auditoría"],
      ["Entrega", "zonas · direcciones · tienda", "tarifa y cobertura", "cálculo servidor"],
    ],
    columnWidths: [180, 390, 310, 270],
    position: { left: 42, top: 202 },
    width: 1196,
    height: 392,
  }),
  tx("data-note", "Integraciones configurables: Google OAuth · PayPal · Cloudinary · correo", 42, 618, 1196, 24, {
    fontSize: 17,
    color: C.green,
    bold: true,
    alignment: "center",
  }),
]);

// 10 — organización del repositorio: adaptación del layout 13.
addSlide("El repositorio ordena código, datos y evidencia", 10, [
  tx("repo-url", "github.com/CHidalgo405/web_integral · rama main", 42, 132, 1196, 32, {
    fontSize: 19,
    color: C.green,
    bold: true,
  }),
  rect("repo-front", 42, 188, 560, 166, C.panel, C.panel),
  rect("repo-back", 636, 188, 602, 166, C.panel, C.panel),
  rect("repo-db", 42, 390, 560, 166, C.panel, C.panel),
  rect("repo-docs", 636, 390, 602, 166, C.panel, C.panel),
  tx("repo-front-title", "Arquitectura/FrontEnd", 68, 214, 500, 32, { fontSize: 26, bold: true }),
  tx("repo-front-body", "Angular · PWA · vistas por rol · pruebas/specs", 68, 268, 500, 58, { fontSize: 19 }),
  tx("repo-back-title", "Arquitectura/Backend", 662, 214, 540, 32, { fontSize: 26, bold: true }),
  tx("repo-back-body", "Express · servicios · rutas · migrador · pruebas Node", 662, 268, 540, 58, { fontSize: 19 }),
  tx("repo-db-title", "Arquitectura/Database", 68, 416, 500, 32, { fontSize: 26, bold: true }),
  tx("repo-db-body", "init.sql · schema.mmd · migraciones reproducibles", 68, 470, 500, 58, { fontSize: 19 }),
  tx("repo-docs-title", "Entregables y Metodología", 662, 416, 540, 32, { fontSize: 26, bold: true }),
  tx("repo-docs-body", "PDF/PPTX finales · fuentes · capturas · referencias históricas", 662, 470, 540, 58, { fontSize: 19 }),
  tx("repo-note", "Cada entregable nuevo se publica en un commit independiente y se sincroniza antes de continuar.", 42, 590, 1196, 28, {
    fontSize: 17,
    color: C.muted,
    alignment: "center",
  }),
]);

// 11 — gráfica Git: adaptación del layout 20.
{
  const slide = addSlide("Git aporta evidencia cuantificable de participación", 11, [
    rect("git-callout-1", 878, 152, 360, 128, C.greenSoft, C.greenSoft, true),
    rect("git-callout-2", 878, 310, 360, 128, C.panel, C.panel, true),
    rect("git-callout-3", 878, 468, 360, 128, C.redSoft, C.redSoft, true),
    tx("git-c1-title", "Carlos · 69", 908, 176, 300, 34, { fontSize: 28, bold: true, color: C.green }),
    tx("git-c1-body", "Identidades normalizadas en todas las referencias alcanzables.", 908, 224, 300, 44, { fontSize: 17 }),
    tx("git-c2-title", "Kevin · 38", 908, 334, 300, 34, { fontSize: 28, bold: true }),
    tx("git-c2-body", "La gráfica incluye también al resto de autores detectados.", 908, 382, 300, 44, { fontSize: 17 }),
    tx("git-c3-title", "Adán · 0 identificado", 908, 492, 300, 34, { fontSize: 25, bold: true, color: C.red }),
    tx("git-c3-body", "Falta confirmar usuario, correo o evidencia externa antes de atribuir trabajo.", 908, 540, 300, 48, { fontSize: 17 }),
    tx("git-source", "Fuente: git log --all en la revisión b61259d · 212 commits normalizados", 42, 620, 800, 24, {
      fontSize: 15,
      color: C.muted,
    }),
  ]);
  slide.charts.add("bar", {
    position: { left: 42, top: 150, width: 780, height: 446 },
    categories: ["Christian", "Carlos", "Kevin", "Zahid", "Diego", "Daniel", "Adán"],
    series: [{
      name: "Commits",
      categories: ["Christian", "Carlos", "Kevin", "Zahid", "Diego", "Daniel", "Adán"],
      values: [63, 69, 38, 25, 10, 7, 0],
      fill: C.green,
    }],
    hasLegend: false,
    dataLabels: { showValue: true, position: "outEnd" },
    chartFill: C.white,
    chartLine: { style: "solid", width: 0, fill: C.white },
    plotAreaFill: { type: "none" },
    xAxis: {
      visible: true,
      line: { style: "solid", width: 1, fill: C.rule },
      textStyle: { typeface: FONT, fontSize: "12px", color: C.ink },
    },
    yAxis: {
      visible: true,
      max: 80,
      majorUnit: 20,
      majorGridlines: { style: "solid", width: 1, fill: C.panel },
      line: { style: "solid", width: 0, fill: C.white },
      textStyle: { typeface: FONT, fontSize: "12px", color: C.ink },
    },
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 80 },
  });
}

// 12 — métricas de pruebas: adaptación del layout 19.
addSlide("La evidencia respalda una aceptación condicionada, no ciega", 12, [
  tx("test-intro", "Resultados ejecutados sobre la revisión 123372c; los documentos posteriores no cambiaron la aplicación.", 42, 132, 1196, 46, {
    fontSize: 20,
    color: C.muted,
  }),
  rect("test-card-1", 42, 224, 374, 260, C.greenSoft, C.greenSoft, true),
  rect("test-card-2", 452, 224, 374, 260, C.amberSoft, C.amberSoft, true),
  rect("test-card-3", 864, 224, 374, 260, C.blueSoft, C.blueSoft, true),
  tx("test-stat-1", "19", 76, 266, 306, 90, { fontSize: 68, bold: true, color: C.green }),
  tx("test-body-1", "pruebas backend aprobadas\n0 fallidas", 76, 382, 306, 70, { fontSize: 22, bold: true }),
  tx("test-stat-2", "2", 486, 266, 306, 90, { fontSize: 68, bold: true, color: C.amber }),
  tx("test-body-2", "integraciones omitidas\nPOS e inventario", 486, 382, 306, 70, { fontSize: 22, bold: true }),
  tx("test-stat-3", "3.858 s", 898, 276, 306, 80, { fontSize: 52, bold: true, color: C.blue }),
  tx("test-body-3", "build frontend aprobado\ncon advertencias", 898, 382, 306, 70, { fontSize: 22, bold: true }),
  rect("test-warning", 42, 526, 1196, 92, C.redSoft, C.redSoft, true),
  tx(
    "test-warning-text",
    "Brechas abiertas: Vitest no encuentra pruebas frontend · restauración no ejecutada · integraciones finales pendientes.\nEvidencia manual: cinco roles y 25 capturas.",
    68,
    548,
    1144,
    54,
    { fontSize: 19, color: C.red, bold: true, alignment: "center" },
  ),
]);

// 13 — objetivos y beneficios: adaptación del layout 11.
addSlide("Objetivos cumplidos; producción aún condicionada", 13, [
  tx("objective-intro", "El sistema ya demuestra valor funcional. La firma debe separar claramente lo entregado de lo que aún requiere cierre.", 42, 132, 1196, 68, {
    fontSize: 22,
  }),
  rect("objective-done", 42, 246, 572, 250, C.greenSoft, C.greenSoft, true),
  rect("objective-open", 666, 246, 572, 250, C.redSoft, C.redSoft, true),
  tx("objective-done-title", "Cumplido y demostrable", 74, 276, 500, 40, { fontSize: 28, bold: true, color: C.green }),
  tx(
    "objective-done-body",
    "• Cinco roles y flujos principales\n• CRUD, reportes y validaciones\n• API, PostgreSQL e integraciones configurables\n• Evidencia visual, Git y documentación",
    74,
    336,
    500,
    134,
    { fontSize: 19 },
  ),
  tx("objective-open-title", "Pendiente antes de producción", 698, 276, 500, 40, { fontSize: 28, bold: true, color: C.red }),
  tx(
    "objective-open-body",
    "• Suite frontend ejecutable\n• POS/inventario sobre bases aisladas\n• Restauración con evidencia\n• Proveedores, marca y ambiente definitivo",
    698,
    336,
    500,
    134,
    { fontSize: 19 },
  ),
  tx(
    "objective-benefit",
    "Beneficio: una sola fuente de verdad para venta, existencias, pedidos, caja y decisiones administrativas.",
    42,
    544,
    1196,
    56,
    { fontSize: 25, bold: true, color: C.green, alignment: "center" },
  ),
]);

// 14 — problemas y soluciones: adaptación del layout 14.
addSlide("Cada problema tiene una respuesta técnica concreta", 14, [
  tx("issues-intro", "Las correcciones se verifican con commit, prueba o recorrido; una corrección no se considera cerrada sin evidencia.", 42, 132, 1196, 46, {
    fontSize: 20,
    color: C.muted,
  }),
  table({
    name: "issues-table",
    rows: 6,
    columns: 4,
    values: [
      ["Problema", "Respuesta implementada", "Evidencia", "Estado"],
      ["OTP generado en cliente", "Código controlado por backend", "c71594e", "Corregido"],
      ["Registro poco validado", "Validación en formulario", "73f0610", "Corregido"],
      ["Totales manipulables", "Servidor recalcula checkout", "9c74895", "Corregido"],
      ["Merges de inventario", "Trazabilidad preservada", "b22d115", "Corregido"],
      ["Pruebas/restore pendientes", "Plan y criterio documentado", "Reporte 03", "Abierto"],
    ],
    columnWidths: [275, 445, 220, 160],
    position: { left: 42, top: 216 },
    width: 1196,
    height: 340,
  }),
  tx(
    "issues-note",
    "Mejora aplicada durante esta entrega: documentación reproducible, diagramas actualizados y evidencia de participación normalizada.",
    42,
    596,
    1196,
    34,
    { fontSize: 18, bold: true, color: C.green, alignment: "center" },
  ),
]);

// 15 — cierre orientado a decisión.
addSlide("Demostrable hoy; producción tras cuatro cierres", 15, [
  tx("close-intro", "La decisión debe basarse en evidencia y reservas explícitas, no en una promesa general de que todo está listo.", 42, 132, 1196, 56, {
    fontSize: 22,
  }),
  tx("close-1", "01", 58, 236, 58, 42, { fontSize: 26, bold: true, color: C.green }),
  tx("close-1b", "Reparar y ejecutar pruebas frontend", 130, 236, 540, 42, { fontSize: 24, bold: true }),
  tx("close-2", "02", 58, 312, 58, 42, { fontSize: 26, bold: true, color: C.green }),
  tx("close-2b", "Ejecutar integraciones POS e inventario", 130, 312, 540, 42, { fontSize: 24, bold: true }),
  tx("close-3", "03", 58, 388, 58, 42, { fontSize: 26, bold: true, color: C.green }),
  tx("close-3b", "Crear y restaurar un respaldo aislado", 130, 388, 540, 42, { fontSize: 24, bold: true }),
  tx("close-4", "04", 58, 464, 58, 42, { fontSize: 26, bold: true, color: C.green }),
  tx("close-4b", "Validar ambiente, proveedores y marca final", 130, 464, 540, 42, { fontSize: 24, bold: true }),
  rect("close-decision", 760, 222, 438, 288, C.green, C.green, true),
  tx("close-decision-kicker", "DECISIÓN INFORMADA", 798, 256, 362, 30, {
    fontSize: 17,
    bold: true,
    color: C.amber,
    alignment: "center",
  }),
  tx("close-decision-title", "Aceptar con reservas documentadas", 798, 318, 362, 98, {
    fontSize: 36,
    bold: true,
    color: C.white,
    alignment: "center",
    verticalAlignment: "middle",
    autoFit: "shrinkText",
  }),
  tx("close-decision-body", "o reprogramar la firma hasta cerrar las brechas críticas", 798, 430, 362, 52, {
    fontSize: 18,
    color: C.white,
    alignment: "center",
  }),
  rect("close-demo", 42, 566, 1196, 70, C.panel, C.panel),
  tx("close-demo-text", "Demo: cliente → POS → inventario → administración → reportes → validaciones y errores", 64, 588, 1152, 28, {
    fontSize: 21,
    bold: true,
    color: C.green,
    alignment: "center",
  }),
]);

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

await fs.mkdir(path.dirname(OUTPUT_PPTX), { recursive: true });
await fs.mkdir(PREVIEW_DIR, { recursive: true });
await fs.mkdir(LAYOUT_DIR, { recursive: true });

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(PREVIEW_DIR, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(LAYOUT_DIR, `${stem}.layout.json`), await layout.text());
}

const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
await writeBlob(path.join(PREVIEW_DIR, "deck-montage.webp"), montage);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUTPUT_PPTX);

console.log(JSON.stringify({ output: OUTPUT_PPTX, slides: presentation.slides.items.length }, null, 2));
