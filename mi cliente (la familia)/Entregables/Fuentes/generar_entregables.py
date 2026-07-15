from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
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


def register_fonts() -> tuple[str, str, str, str]:
    font_dir = Path("C:/Windows/Fonts")
    candidates = {
        "body": font_dir / "arial.ttf",
        "bold": font_dir / "arialbd.ttf",
        "italic": font_dir / "ariali.ttf",
        "bolditalic": font_dir / "arialbi.ttf",
    }
    if all(path.exists() for path in candidates.values()):
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
        canvas.setFont(FONT, 7.5)
        canvas.setFillColor(MID_GRAY)
        canvas.drawString(self.leftMargin, 0.34 * inch, "Version 1.0 | 14 de julio de 2026")
        canvas.drawRightString(width - self.rightMargin, 0.34 * inch, f"Pagina {doc.page}")
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
        if stripped.startswith("|" ) and stripped.endswith("|"):
            flush_paragraph()
            table_rows.append([cell.strip() for cell in stripped.strip("|").split("|")])
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
    sources = sorted(HERE.glob("0[0-4]_*.md"))
    if len(sources) != 5:
        raise SystemExit(f"Se esperaban 5 fuentes y se encontraron {len(sources)}")
    for source in sources:
        output = build_one(source)
        print(output.name)


if __name__ == "__main__":
    main()
