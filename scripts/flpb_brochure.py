from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import zlib
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


STREAM_PATTERN = re.compile(rb"(\d+)\s+0\s+obj(.*?)endobj", re.S)
PAGE_CONTENT_PATTERN = re.compile(rb"/Contents\s+(\d+)\s+0\s+R")
XOBJECT_PATTERN = re.compile(rb"/Im\d+\s+(\d+)\s+0\s+R")
TJ_PATTERN = re.compile(rb"\[((?:.|\r|\n)*?)\]\s*TJ")
Tj_PATTERN = re.compile(rb"\(([^()]*)\)\s*Tj")


@dataclass
class PdfObject:
    number: int
    body: bytes


def normalize(text: str) -> str:
    lowered = text.lower().replace("&", "and")
    return re.sub(r"[^a-z0-9]+", "", lowered)


def decode_literal(raw: bytes) -> str:
    return (
        raw.decode("latin1", errors="ignore")
        .replace("\\(", "(")
        .replace("\\)", ")")
        .replace("\\\\", "\\")
        .strip()
    )


def build_object_map(pdf_bytes: bytes) -> dict[int, PdfObject]:
    objects: dict[int, PdfObject] = {}
    for match in STREAM_PATTERN.finditer(pdf_bytes):
        objects[int(match.group(1))] = PdfObject(
            number=int(match.group(1)),
            body=match.group(2),
        )
    return objects


def get_stream_bytes(obj: PdfObject) -> bytes | None:
    stream_match = re.search(rb"stream\r?\n", obj.body)
    if not stream_match:
        return None

    stream = obj.body[stream_match.end() :]
    end_index = stream.rfind(b"endstream")
    if end_index == -1:
        return None

    stream = stream[:end_index]
    if stream.endswith(b"\r\n"):
        stream = stream[:-2]
    elif stream.endswith(b"\n"):
        stream = stream[:-1]

    return stream


def inflate_stream(obj: PdfObject) -> bytes | None:
    if b"/FlateDecode" not in obj.body:
        return None

    stream = get_stream_bytes(obj)
    if stream is None:
        return None

    try:
        return zlib.decompress(stream)
    except zlib.error:
        return None


def extract_text_snippets(content_stream: bytes) -> list[str]:
    snippets: list[str] = []

    for match in TJ_PATTERN.finditer(content_stream):
        parts = re.findall(rb"\(([^()]*)\)", match.group(1))
        if parts:
            text = "".join(decode_literal(part) for part in parts).strip()
            if re.search(r"[A-Za-z]{3,}", text):
                snippets.append(text)

    for match in Tj_PATTERN.finditer(content_stream):
        text = decode_literal(match.group(1))
        if re.search(r"[A-Za-z]{3,}", text):
            snippets.append(text)

    return snippets


def iter_page_records(objects: dict[int, PdfObject]) -> Iterable[dict[str, object]]:
    page_number = 0
    for obj_number in sorted(objects):
        obj = objects[obj_number]
        if b"/Type/Page" not in obj.body:
            continue

        content_match = PAGE_CONTENT_PATTERN.search(obj.body)
        if not content_match:
            continue

        page_number += 1
        content_object_number = int(content_match.group(1))
        content_object = objects.get(content_object_number)
        if content_object is None:
            continue

        inflated = inflate_stream(content_object)
        snippets = extract_text_snippets(inflated or b"")
        image_objects = [
            int(match.group(1)) for match in XOBJECT_PATTERN.finditer(obj.body)
        ]

        yield {
            "page": page_number,
            "page_object": obj_number,
            "content_object": content_object_number,
            "image_objects": image_objects,
            "text_snippets": snippets,
        }


def load_catalog(catalog_path: Path) -> list[str]:
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    names: list[str] = []
    for value in catalog.values():
        if not isinstance(value, list):
            continue
        for item in value:
            names.append(item["plate"]["LicensePlate"])
    return names


def extract_images(
    objects: dict[int, PdfObject], images_dir: Path, convert_to_png: bool
) -> list[dict[str, object]]:
    images_dir.mkdir(parents=True, exist_ok=True)
    image_manifest: list[dict[str, object]] = []
    magick_path = shutil.which("magick")

    for obj_number in sorted(objects):
        obj = objects[obj_number]
        if b"/Subtype/Image" not in obj.body and b"/Subtype /Image" not in obj.body:
            continue

        stream = get_stream_bytes(obj)
        if stream is None:
            continue

        filter_match = re.search(rb"/Filter\s*(\[[^\]]+\]|/\w+)", obj.body, re.S)
        width_match = re.search(rb"/Width\s+(\d+)", obj.body)
        height_match = re.search(rb"/Height\s+(\d+)", obj.body)

        filter_value = (
            filter_match.group(1).decode("latin1", errors="ignore")
            if filter_match
            else ""
        )
        extension = ".bin"
        if "/JPXDecode" in filter_value:
            extension = ".jpx"
        elif "/DCTDecode" in filter_value:
            extension = ".jpg"
        elif "/FlateDecode" in filter_value:
            extension = ".flate"

        raw_path = images_dir / f"obj-{obj_number:04d}{extension}"
        raw_path.write_bytes(stream)

        converted_path: str | None = None
        if convert_to_png and magick_path and extension in {".jpx", ".jpg"}:
            png_path = raw_path.with_suffix(".png")
            result = subprocess.run(
                [magick_path, str(raw_path), str(png_path)],
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode == 0 and png_path.exists():
                converted_path = str(png_path)

        image_manifest.append(
            {
                "object": obj_number,
                "filter": filter_value,
                "width": int(width_match.group(1)) if width_match else None,
                "height": int(height_match.group(1)) if height_match else None,
                "raw_path": str(raw_path),
                "png_path": converted_path,
            }
        )

    return image_manifest


def write_report(
    report_path: Path,
    pdf_path: Path,
    page_records: list[dict[str, object]],
    image_manifest: list[dict[str, object]],
    current_names: list[str],
) -> None:
    normalized_brochure = {
        normalize(snippet)
        for record in page_records
        for snippet in record["text_snippets"]
        if isinstance(snippet, str)
    }
    exact_matches = [
        name for name in current_names if normalize(name) in normalized_brochure
    ]
    unmatched = [
        name for name in current_names if normalize(name) not in normalized_brochure
    ]

    page_preview = []
    for record in page_records[:8]:
        snippets = [snippet for snippet in record["text_snippets"] if isinstance(snippet, str)]
        title = " | ".join(snippets[:3]) if snippets else "(no text extracted)"
        page_preview.append(
            f"- Page {record['page']}: {len(record['image_objects'])} images, {len(snippets)} text snippets, preview: {title}"
        )

    report_lines = [
        "# FLPB Brochure Assessment",
        "",
        f"- Source PDF: `{pdf_path}`",
        f"- Brochure pages parsed: {len(page_records)}",
        f"- Embedded image objects extracted: {len(image_manifest)}",
        f"- Current game plates: {len(current_names)}",
        f"- Exact normalized name matches found in brochure text: {len(exact_matches)}",
        "",
        "## What This Means",
        "",
        "- The brochure is usable as an import source because it contains page text plus embedded plate images.",
        "- A straight auto-import is still risky because some brochure labels are split across multiple text runs or encoded in custom fonts.",
        "- The extracted images and page previews give us enough structure to do a staged migration safely.",
        "",
        "## Sample Page Inventory",
        "",
        *page_preview,
        "",
        "## Current Plate Names Not Matched Exactly",
        "",
    ]

    report_lines.extend(f"- {name}" for name in unmatched[:50])
    if len(unmatched) > 50:
        report_lines.append(f"- ... and {len(unmatched) - 50} more")

    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(report_lines) + "\n", encoding="utf-8")


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/flpb_brochure.py <path-to-pdf>")
        return 1

    pdf_path = Path(sys.argv[1]).expanduser()
    if not pdf_path.exists():
        print(f"Missing PDF: {pdf_path}")
        return 1

    repo_root = Path(__file__).resolve().parent.parent
    output_root = repo_root / "analysis" / "flpb"
    images_dir = output_root / "images"
    manifest_path = output_root / "image-manifest.json"
    pages_path = output_root / "pages.json"
    report_path = output_root / "report.md"
    catalog_path = repo_root / "src" / "data" / "floridaPlates.json"

    objects = build_object_map(pdf_path.read_bytes())
    page_records = list(iter_page_records(objects))
    image_manifest = extract_images(objects, images_dir, convert_to_png=True)
    current_names = load_catalog(catalog_path)

    output_root.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(image_manifest, indent=2), encoding="utf-8")
    pages_path.write_text(json.dumps(page_records, indent=2), encoding="utf-8")
    write_report(report_path, pdf_path, page_records, image_manifest, current_names)

    print(f"Wrote image manifest: {manifest_path}")
    print(f"Wrote page inventory: {pages_path}")
    print(f"Wrote report: {report_path}")
    print(f"Extracted {len(image_manifest)} image objects to {images_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
