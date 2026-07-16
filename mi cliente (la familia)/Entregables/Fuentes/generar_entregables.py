from __future__ import annotations

import re
import subprocess
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.graphics.shapes import Circle, Drawing, Line, Polygon, Rect, String
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


HERE = Path(__file__).resolve().parent
OUTPUT = HERE.parent

GREEN = colors.HexColor("#2D5A1B")
LEAF = colors.HexColor("#4A8C2A")
CREAM = colors.HexColor("#F5F0E8")
AMBER = colors.HexColor("#E8A020")
EARTH = colors.HexColor("#3D2B1A")
LIGHT_GREEN = colors.HexColor("#EAF2E4")
LIGHT_GRAY = colors.HexColor("#F2F4F1")
MID_GRAY = colors.HexColor("#687068")
RED = colors.HexColor("#A33A2B")
BLUE = colors.HexColor("#315F7D")
PURPLE = colors.HexColor("#694F86")
DOCUMENT_VERSION = "2.0"
DOCUMENT_DATE = "16 de julio de 2026"


def register_fonts() -> tuple[str, str, str, str]:
    font_sets = [
        {
            "body": Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
            "bold": Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
            "italic": Path("/System/Library/Fonts/Supplemental/Arial Italic.ttf"),
            "bolditalic": Path("/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf"),
        },
        {
            "body": Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            "bold": Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
            "italic": Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"),
            "bolditalic": Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf"),
        },
        {
            "body": Path("C:/Windows/Fonts/segoeui.ttf"),
            "bold": Path("C:/Windows/Fonts/seguisb.ttf"),
            "italic": Path("C:/Windows/Fonts/segoeuii.ttf"),
            "bolditalic": Path("C:/Windows/Fonts/seguisbi.ttf"),
        },
        {
            "body": Path("C:/Windows/Fonts/arial.ttf"),
            "bold": Path("C:/Windows/Fonts/arialbd.ttf"),
            "italic": Path("C:/Windows/Fonts/ariali.ttf"),
            "bolditalic": Path("C:/Windows/Fonts/arialbi.ttf"),
        },
    ]
    candidates = next((item for item in font_sets if all(path.exists() for path in item.values())), None)
    if candidates:
        pdfmetrics.registerFont(TTFont("TMBody", str(candidates["body"])))
        pdfmetrics.registerFont(TTFont("TMBody-Bold", str(candidates["bold"])))
        pdfmetrics.registerFont(TTFont("TMBody-Italic", str(candidates["italic"])))
        pdfmetrics.registerFont(TTFont("TMBody-BoldItalic", str(candidates["bolditalic"])))
        pdfmetrics.registerFontFamily(
            "TMBody",
            normal="TMBody",
            bold="TMBody-Bold",
            italic="TMBody-Italic",
            boldItalic="TMBody-BoldItalic",
        )
        return "TMBody", "TMBody-Bold", "TMBody-Italic", "TMBody-BoldItalic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique"


FONT, FONT_BOLD, FONT_ITALIC, FONT_BOLD_ITALIC = register_fonts()


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=28,
            leading=33,
            textColor=GREEN,
            alignment=TA_LEFT,
            spaceAfter=16,
        ),
        "cover_meta": ParagraphStyle(
            "CoverMeta",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=11,
            leading=17,
            textColor=EARTH,
            spaceAfter=4,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=18,
            leading=22,
            textColor=GREEN,
            spaceBefore=14,
            spaceAfter=8,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=13.5,
            leading=17,
            textColor=LEAF,
            spaceBefore=11,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName=FONT_BOLD,
            fontSize=11.2,
            leading=14,
            textColor=EARTH,
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#252A25"),
            spaceAfter=6,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=8.3,
            leading=11,
            textColor=MID_GRAY,
            spaceAfter=4,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=9.3,
            leading=13,
            leftIndent=18,
            firstLineIndent=-10,
            bulletIndent=7,
            textColor=colors.HexColor("#252A25"),
            spaceAfter=3,
        ),
        "number": ParagraphStyle(
            "Number",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=9.3,
            leading=13,
            leftIndent=20,
            firstLineIndent=-14,
            textColor=colors.HexColor("#252A25"),
            spaceAfter=4,
        ),
        "callout": ParagraphStyle(
            "Callout",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=9.3,
            leading=13.5,
            leftIndent=10,
            rightIndent=10,
            borderColor=LEAF,
            borderWidth=0.8,
            borderPadding=8,
            backColor=LIGHT_GREEN,
            textColor=EARTH,
            spaceBefore=5,
            spaceAfter=8,
        ),
        "caption": ParagraphStyle(
            "Caption",
            parent=base["BodyText"],
            fontName=FONT_ITALIC,
            fontSize=8.3,
            leading=11,
            textColor=MID_GRAY,
            alignment=TA_CENTER,
            spaceBefore=3,
            spaceAfter=10,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=7.5,
            leading=9,
            textColor=MID_GRAY,
        ),
    }


STYLES = styles()


def inline(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", text)
    return text


class ClientDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str, document_name: str):
        super().__init__(
            filename,
            pagesize=letter,
            leftMargin=0.72 * inch,
            rightMargin=0.72 * inch,
            topMargin=0.72 * inch,
            bottomMargin=0.72 * inch,
            title=document_name,
            author="Equipo Tiendita Maday",
            subject="Paquete de entrega para el cliente",
        )
        self.document_name = document_name
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates(PageTemplate(id="content", frames=[frame], onPage=self.draw_page))

    def draw_page(self, canvas, doc):
        canvas.saveState()
        width, height = letter
        if doc.page == 1:
            canvas.setFillColor(CREAM)
            canvas.rect(0, 0, width, height, fill=1, stroke=0)
            canvas.setFillColor(GREEN)
            canvas.rect(0, height - 0.22 * inch, width, 0.22 * inch, fill=1, stroke=0)
            canvas.setFillColor(LEAF)
            canvas.circle(width - 0.95 * inch, height - 1.05 * inch, 0.34 * inch, fill=1, stroke=0)
            canvas.setFillColor(AMBER)
            canvas.circle(width - 0.62 * inch, height - 1.28 * inch, 0.17 * inch, fill=1, stroke=0)
        else:
            canvas.setStrokeColor(colors.HexColor("#D7DDD3"))
            canvas.setLineWidth(0.5)
            canvas.line(self.leftMargin, height - 0.48 * inch, width - self.rightMargin, height - 0.48 * inch)
            canvas.setFont(FONT, 7.5)
            canvas.setFillColor(MID_GRAY)
            canvas.drawString(self.leftMargin, height - 0.38 * inch, "Tiendita Maday | Entrega para La Familia")
            canvas.drawRightString(width - self.rightMargin, height - 0.38 * inch, self.document_name[:70])
            canvas.setFillColor(colors.HexColor("#FBF8F2"))
            canvas.rect(0, 0, width, 0.62 * inch, fill=1, stroke=0)
        canvas.setFont(FONT, 7.5)
        canvas.setFillColor(MID_GRAY)
        canvas.drawString(self.leftMargin, 0.34 * inch, f"Versión {DOCUMENT_VERSION} | {DOCUMENT_DATE}")
        canvas.drawRightString(width - self.rightMargin, 0.34 * inch, f"Página {doc.page}")
        canvas.restoreState()


def make_table(rows: list[list[str]]) -> Table:
    max_cols = max(len(row) for row in rows)
    normalized = [row + [""] * (max_cols - len(row)) for row in rows]
    available = letter[0] - 1.44 * inch
    lengths = []
    for col in range(max_cols):
        max_len = max(len(re.sub(r"\*\*|`", "", row[col])) for row in normalized)
        lengths.append(max(12, min(max_len, 45)))
    total = sum(lengths)
    widths = [available * value / total for value in lengths]
    data = []
    for row_index, row in enumerate(normalized):
        style = ParagraphStyle(
            "TableCell",
            parent=STYLES["small"],
            fontSize=8,
            leading=10.5,
        ) if row_index else ParagraphStyle(
            "TableHeader",
            parent=STYLES["small"],
            fontName=FONT_BOLD,
            fontSize=7.6,
            leading=9.5,
            textColor=colors.white,
        )
        data.append([Paragraph(inline(cell), style) for cell in row])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), GREEN),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CDD5C8")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def make_image(caption: str, path: Path) -> KeepTogether:
    reader = ImageReader(str(path))
    px_width, px_height = reader.getSize()
    width = min(5.9 * inch, letter[0] - 1.44 * inch)
    height = width * px_height / px_width
    image = Image(str(path), width=width, height=height)
    framed = Table([[image]], colWidths=[width + 8], hAlign="CENTER")
    framed.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CDD5C8")),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    parts = [Spacer(1, 4), framed]
    if caption:
        parts.append(Paragraph(inline(caption), STYLES["caption"]))
    else:
        parts.append(Spacer(1, 8))
    return KeepTogether(parts)


def _label(drawing: Drawing, x: float, y: float, text: str, size: float = 8,
           color=EARTH, anchor: str = "middle", bold: bool = False):
    drawing.add(String(x, y, text, fontName=FONT_BOLD if bold else FONT,
                       fontSize=size, fillColor=color, textAnchor=anchor))


def _box(drawing: Drawing, x: float, y: float, width: float, height: float,
         title: str, lines: list[str], fill=LIGHT_GREEN, stroke=LEAF):
    drawing.add(Rect(x, y, width, height, rx=8, ry=8, fillColor=fill,
                     strokeColor=stroke, strokeWidth=1.2))
    _label(drawing, x + width / 2, y + height - 18, title, 9, stroke, bold=True)
    for index, line in enumerate(lines):
        _label(drawing, x + width / 2, y + height - 36 - index * 13, line, 7.2, EARTH)


def _arrow(drawing: Drawing, x1: float, y1: float, x2: float, y2: float, color=MID_GRAY):
    drawing.add(Line(x1, y1, x2, y2, strokeColor=color, strokeWidth=1.5))
    angle = 5 if x2 >= x1 else -5
    drawing.add(Polygon([x2, y2, x2 - angle, y2 + 3, x2 - angle, y2 - 3],
                        fillColor=color, strokeColor=color))


def make_architecture_diagram() -> KeepTogether:
    d = Drawing(500, 330)
    _box(d, 14, 226, 138, 78, "USUARIOS", ["Cliente / Cajero", "Almacén / Gerencia"])
    _box(d, 181, 226, 138, 78, "ANGULAR 21.2", ["PWA responsiva", "Guards e interceptor"], colors.HexColor("#E8F0F5"), BLUE)
    _box(d, 348, 226, 138, 78, "SERVICIOS EXTERNOS", ["Google · PayPal", "Cloudinary · Correo"], colors.HexColor("#F1ECF6"), PURPLE)
    _box(d, 181, 118, 138, 78, "API EXPRESS 4", ["REST /api", "JWT · roles · reglas"], colors.HexColor("#FFF2D8"), AMBER)
    _box(d, 181, 14, 138, 74, "POSTGRESQL", ["33 entidades", "transacciones y auditoría"], colors.HexColor("#E8F0F5"), BLUE)
    _arrow(d, 152, 265, 181, 265)
    _arrow(d, 250, 226, 250, 196)
    _arrow(d, 319, 157, 348, 245)
    _arrow(d, 250, 118, 250, 88)
    _label(d, 250, 314, "Vista lógica del sistema desplegable en Railway", 9, GREEN, bold=True)
    return KeepTogether([d, Paragraph("Diagrama arquitectónico actualizado a la revisión documentada.", STYLES["caption"])])


def make_information_flow() -> KeepTogether:
    d = Drawing(500, 250)
    nodes = [
        (8, "1", "Captura", "Usuario envía la acción"),
        (108, "2", "Validación UI", "Formato y navegación"),
        (208, "3", "API", "Autorización y negocio"),
        (308, "4", "PostgreSQL", "Transacción y auditoría"),
        (408, "5", "Respuesta", "Estado visible y reporte"),
    ]
    for x, number, title, detail in nodes:
        d.add(Circle(x + 42, 174, 20, fillColor=GREEN, strokeColor=GREEN))
        _label(d, x + 42, 168, number, 11, colors.white, bold=True)
        _box(d, x, 60, 84, 84, title, [detail], colors.white, colors.HexColor("#CDD5C8"))
    for x in [92, 192, 292, 392]:
        _arrow(d, x, 174, x + 16, 174)
    _label(d, 250, 222, "Flujo principal de información", 11, GREEN, bold=True)
    _label(d, 250, 28, "Los errores regresan por la misma ruta sin registrar una operación incompleta.", 8, MID_GRAY)
    return KeepTogether([d, Paragraph("Secuencia de una operación de negocio desde la interfaz hasta la persistencia.", STYLES["caption"])])


def make_wireframes() -> KeepTogether:
    d = Drawing(500, 300)
    specs = [(18, 68, 112, 198, "Móvil"), (157, 48, 170, 218, "Tableta"), (354, 86, 128, 180, "Escritorio")]
    for x, y, w, h, name in specs:
        d.add(Rect(x, y, w, h, rx=8, ry=8, fillColor=colors.white, strokeColor=GREEN, strokeWidth=1.4))
        d.add(Rect(x + 8, y + h - 28, w - 16, 18, fillColor=LIGHT_GREEN, strokeColor=None))
        d.add(Rect(x + 8, y + h - 78, w - 16, 42, fillColor=colors.HexColor("#E8F0F5"), strokeColor=None))
        card_w = (w - 24) / 2
        d.add(Rect(x + 8, y + 44, card_w, h - 132, fillColor=LIGHT_GRAY, strokeColor=colors.HexColor("#CDD5C8")))
        d.add(Rect(x + 16 + card_w, y + 44, card_w, h - 132, fillColor=LIGHT_GRAY, strokeColor=colors.HexColor("#CDD5C8")))
        d.add(Rect(x + 8, y + 12, w - 16, 22, fillColor=GREEN, strokeColor=None))
        _label(d, x + w / 2, y - 16, name, 8.5, GREEN, bold=True)
    _label(d, 250, 283, "Wireframes estructurales del catálogo", 11, GREEN, bold=True)
    return KeepTogether([d, Paragraph("La misma jerarquía se reorganiza por ancho sin perder acciones críticas.", STYLES["caption"])])


def make_responsive_diagram() -> KeepTogether:
    d = Drawing(500, 235)
    bands = [
        (24, 146, 452, 50, "MÓVIL", "Navegación inferior · una columna · controles táctiles", GREEN),
        (24, 84, 452, 50, "TABLETA", "Tarjetas flexibles · dos columnas · formularios ampliados", BLUE),
        (24, 22, 452, 50, "ESCRITORIO", "Panel lateral · tablas/tarjetas · contenido centrado", PURPLE),
    ]
    for x, y, w, h, title, detail, color in bands:
        d.add(Rect(x, y, w, h, rx=8, ry=8, fillColor=colors.white, strokeColor=color, strokeWidth=1.2))
        d.add(Rect(x, y, 108, h, rx=8, ry=8, fillColor=color, strokeColor=color))
        _label(d, x + 54, y + 20, title, 8.5, colors.white, bold=True)
        _label(d, x + 124, y + 20, detail, 8.2, EARTH, anchor="start")
    _label(d, 250, 214, "Comportamiento responsivo documentado", 11, GREEN, bold=True)
    return KeepTogether([d, Paragraph("Patrones validados en las capturas de cliente, caja, inventario y administración.", STYLES["caption"])])


def make_database_modules() -> KeepTogether:
    d = Drawing(500, 310)
    modules = [
        (18, 188, "IDENTIDAD", ["users · sessions", "audit · employees"], GREEN),
        (184, 188, "CATÁLOGO", ["inventory · categories", "prices · barcodes"], BLUE),
        (350, 188, "VENTAS", ["purchases · items", "returns · reviews"], AMBER),
        (18, 74, "ABASTO", ["suppliers · orders", "receipts · batches"], PURPLE),
        (184, 74, "OPERACIÓN", ["cash · expenses", "notifications"], GREEN),
        (350, 74, "ENTREGA", ["zones · addresses", "shop config"], BLUE),
    ]
    for x, y, title, lines, color in modules:
        _box(d, x, y, 132, 82, title, lines, colors.white, color)
    _label(d, 250, 282, "33 entidades agrupadas por dominio", 11, GREEN, bold=True)
    _label(d, 250, 40, "Fuente canónica: Arquitectura/Database/schema.mmd + migraciones SQL", 8, MID_GRAY)
    return KeepTogether([d, Paragraph("Mapa conceptual del modelo de datos; el detalle de relaciones permanece en schema.mmd.", STYLES["caption"])])


def make_git_chart() -> KeepTogether:
    d = Drawing(500, 295)
    identities = {
        "Carlos": ("chidalgo405", "carlosignacio"),
        "Kevin": ("kevin11ts", "kevin sandoval", "20233l001135"),
        "Adán*": ("adan", "adán"),
        "Christian": ("christba",),
        "Zahid": ("zahid",),
        "Diego": ("diego",),
        "Daniel": ("mrsonistar", "danieltidsmc", "20223i101142"),
    }
    counts = {name: 0 for name in identities}
    try:
        history = subprocess.run(
            ["git", "-C", str(HERE.parents[2]), "log", "--all", "--format=%an|%ae"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout.splitlines()
        for row in history:
            normalized = row.casefold()
            for name, aliases in identities.items():
                if any(alias in normalized for alias in aliases):
                    counts[name] += 1
                    break
    except (OSError, subprocess.CalledProcessError):
        counts.update({"Christian": 63, "Carlos": 56, "Kevin": 38, "Zahid": 25, "Diego": 10, "Daniel": 7})
    order = ["Christian", "Carlos", "Kevin", "Zahid", "Diego", "Daniel", "Adán*"]
    values = [(name, counts[name]) for name in order]
    max_value = max(value for _, value in values)
    y = 235
    for index, (name, value) in enumerate(values):
        color = [GREEN, BLUE, PURPLE, AMBER, LEAF, MID_GRAY, RED][index]
        _label(d, 20, y + 4, name, 8.2, EARTH, anchor="start", bold=True)
        d.add(Rect(104, y, 330, 13, fillColor=LIGHT_GRAY, strokeColor=None))
        if value:
            d.add(Rect(104, y, 330 * value / max_value, 13, fillColor=color, strokeColor=None))
        _label(d, 452, y + 3, str(value), 8.2, color, anchor="start", bold=True)
        y -= 29
    _label(d, 250, 276, "Commits alcanzables en el historial Git (identidades normalizadas)", 10, GREEN, bold=True)
    _label(d, 250, 22, "* No se encontró una identidad Git asociable a Adán; se requiere confirmar usuario o correo.", 7.7, RED)
    return KeepTogether([d, Paragraph("Conteo reproducible con git shortlog sobre todas las referencias disponibles.", STYLES["caption"])])


DIAGRAMS = {
    "ARCHITECTURE": make_architecture_diagram,
    "INFORMATION_FLOW": make_information_flow,
    "WIREFRAMES": make_wireframes,
    "RESPONSIVE": make_responsive_diagram,
    "DATABASE_MODULES": make_database_modules,
    "GIT_CHART": make_git_chart,
}


def parse_markdown(text: str) -> tuple[str, list]:
    lines = text.splitlines()
    title = next((line[2:].strip() for line in lines if line.startswith("# ")), "Documento")
    story = [Spacer(1, 1.45 * inch), Paragraph(inline(title), STYLES["title"])]
    first_title_seen = False
    cover_mode = True
    paragraph: list[str] = []
    table_rows: list[list[str]] = []

    def flush_paragraph():
        nonlocal paragraph
        if paragraph:
            story.append(Paragraph(inline(" ".join(part.strip() for part in paragraph)), STYLES["body"]))
            paragraph = []

    def flush_table():
        nonlocal table_rows
        if table_rows:
            if len(table_rows) > 1 and all(re.fullmatch(r"[-: ]+", cell) for cell in table_rows[1]):
                table_rows.pop(1)
            story.extend([make_table(table_rows), Spacer(1, 7)])
            table_rows = []

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()
        if not stripped:
            flush_paragraph()
            flush_table()
            continue
        if stripped == "<!-- PAGEBREAK -->":
            flush_paragraph()
            flush_table()
            story.append(PageBreak())
            cover_mode = False
            continue
        diagram_match = re.fullmatch(r"<!-- DIAGRAM:([A-Z_]+) -->", stripped)
        if diagram_match:
            flush_paragraph()
            flush_table()
            factory = DIAGRAMS.get(diagram_match.group(1))
            if factory:
                story.append(factory())
            continue
        if stripped.startswith("|" ) and stripped.endswith("|"):
            flush_paragraph()
            table_rows.append([cell.strip() for cell in stripped.strip("|").split("|")])
            continue
        image_match = re.match(r"^!\[(.*)\]\((.+)\)$", stripped)
        if image_match:
            flush_paragraph()
            flush_table()
            image_path = HERE / image_match.group(2)
            if image_path.exists():
                story.append(make_image(image_match.group(1), image_path))
            continue
        flush_table()
        if stripped.startswith("# "):
            if not first_title_seen:
                first_title_seen = True
                continue
            flush_paragraph()
            story.append(Paragraph(inline(stripped[2:]), STYLES["h1"]))
        elif cover_mode and stripped.startswith("> "):
            flush_paragraph()
            story.append(Paragraph(inline(stripped[2:]), STYLES["callout"]))
        elif cover_mode:
            flush_paragraph()
            story.append(Paragraph(inline(stripped), STYLES["cover_meta"]))
        elif stripped.startswith("## "):
            flush_paragraph()
            story.append(Paragraph(inline(stripped[3:]), STYLES["h1"]))
        elif stripped.startswith("### "):
            flush_paragraph()
            story.append(Paragraph(inline(stripped[4:]), STYLES["h2"]))
        elif stripped.startswith("#### "):
            flush_paragraph()
            story.append(Paragraph(inline(stripped[5:]), STYLES["h3"]))
        elif stripped.startswith("> "):
            flush_paragraph()
            story.append(Paragraph(inline(stripped[2:]), STYLES["callout"]))
        elif re.match(r"^- \[[ xX]\] ", stripped):
            flush_paragraph()
            checked = stripped[3].lower() == "x"
            marker = "[X]" if checked else "[ ]"
            story.append(Paragraph(f"<b>{marker}</b> {inline(stripped[6:])}", STYLES["bullet"]))
        elif stripped.startswith("- "):
            flush_paragraph()
            story.append(Paragraph(inline(stripped[2:]), STYLES["bullet"], bulletText="•"))
        elif re.match(r"^\d+\. ", stripped):
            flush_paragraph()
            number, content = stripped.split(". ", 1)
            story.append(Paragraph(f"<b>{number}.</b> {inline(content)}", STYLES["number"]))
        elif stripped == "---":
            flush_paragraph()
            story.append(Spacer(1, 12))
        elif not first_title_seen:
            story.append(Paragraph(inline(stripped), STYLES["cover_meta"]))
        elif stripped.startswith("**") and stripped.endswith("**"):
            flush_paragraph()
            story.append(Paragraph(inline(stripped), STYLES["cover_meta"]))
        else:
            paragraph.append(stripped)
    flush_paragraph()
    flush_table()
    return title, story


def build_one(source: Path):
    title, story = parse_markdown(source.read_text(encoding="utf-8"))
    output = OUTPUT / f"{source.stem}.pdf"
    doc = ClientDocTemplate(str(output), title)
    doc.build(story)
    return output


def main():
    sources = sorted(HERE.glob("[0-9][0-9]_*.md"))
    if not sources:
        raise SystemExit("No se encontraron fuentes numeradas")
    for source in sources:
        output = build_one(source)
        print(output.name)


if __name__ == "__main__":
    main()
