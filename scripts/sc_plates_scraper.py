"""
South Carolina DMV plate gallery scraper.

Source: https://dmv.sc.gov/vehicle-owners/registration/plate-gallery
The page is fully server-rendered Drupal — every plate is in a single HTML
document inside <article class="plate gridder-list"> blocks. There is no
JS execution and no pagination.

Output:
  SC/sc_plates_output/sc_plates.json   — JSON with one entry per plate
  SC/sc_plates_output/images/<slug>.png — downloaded plate art
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen

GALLERY_URL = "https://dmv.sc.gov/vehicle-owners/registration/plate-gallery"
BASE_HOST = "https://dmv.sc.gov"
USER_AGENT = "every-pl8 importer (contact: bwise@mysagedental.com)"

OUTPUT_DIR = Path(__file__).resolve().parent / "sc_plates_output"
HTML_PATH = OUTPUT_DIR / "gallery.html"
JSON_PATH = OUTPUT_DIR / "sc_plates.json"
IMAGES_DIR = OUTPUT_DIR / "images"


def fetch_text(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def fetch_bytes(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        return resp.read()


def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r"&", " and ", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s


# Capture: <article class="plate gridder-list" data-griddercontent="#NNNN" id="NNNN" data-categories="...">
# … <img data-src="/sites/scdmv/files/media/Images/Plates/...">
# … <h4 class="plate-title">Name</h4>
# … <p>Description</p>  (first <p> inside .plate-description)
ARTICLE_RE = re.compile(
    r'<article\s+class="plate gridder-list"[^>]*?\bid="(?P<id>\d+)"[^>]*?\bdata-categories="(?P<cats>[^"]*)"[^>]*?>'
    r'(?P<body>.*?)</article>',
    re.DOTALL,
)
IMG_RE = re.compile(r'data-src="(?P<src>/sites/scdmv/files/[^"]+\.(?:png|jpg|jpeg|gif))"', re.IGNORECASE)
TITLE_RE = re.compile(r'<h4 class="plate-title">(?P<title>[^<]+)</h4>')
DESC_RE = re.compile(
    r'<div class="plate-description">\s*<p>(?P<desc>.*?)</p>',
    re.DOTALL,
)


def strip_tags(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_gallery(html: str) -> list[dict]:
    plates: list[dict] = []
    for match in ARTICLE_RE.finditer(html):
        plate_id = match.group("id")
        cats_raw = match.group("cats").strip()
        body = match.group("body")

        img_match = IMG_RE.search(body)
        title_match = TITLE_RE.search(body)
        desc_match = DESC_RE.search(body)

        if not img_match or not title_match:
            print(f"WARN: skipping plate id={plate_id} — missing image or title", file=sys.stderr)
            continue

        image_path = img_match.group("src")
        image_url = BASE_HOST + image_path
        image_filename = image_path.rsplit("/", 1)[-1]

        title = unescape(title_match.group("title")).strip()
        description = strip_tags(desc_match.group("desc")) if desc_match else ""

        categories = [c for c in cats_raw.split() if c]

        plates.append({
            "scrape_id": plate_id,
            "name": title,
            "slug": slugify(title),
            "categories": categories,
            "description": description,
            "image_url": image_url,
            "image_filename": image_filename,
        })
    return plates


def deduplicate(plates: list[dict]) -> list[dict]:
    """Some pages emit two articles per plate (article + lightbox dup).
    Dedupe by (slug, image_filename) keeping the first occurrence."""
    seen = set()
    deduped = []
    for p in plates:
        key = (p["slug"], p["image_filename"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(p)
    return deduped


def download_image(plate: dict) -> Path | None:
    target = IMAGES_DIR / f"{plate['slug']}{Path(plate['image_filename']).suffix}"
    if target.exists() and target.stat().st_size > 0:
        return target
    try:
        data = fetch_bytes(plate["image_url"])
    except Exception as exc:
        print(f"WARN: failed to download {plate['image_url']}: {exc}", file=sys.stderr)
        return None
    target.write_bytes(data)
    time.sleep(0.05)
    return target


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    if HTML_PATH.exists() and HTML_PATH.stat().st_size > 0:
        html = HTML_PATH.read_text(encoding="utf-8")
        print(f"Reusing cached gallery HTML ({HTML_PATH.stat().st_size} bytes)")
    else:
        print(f"Fetching {GALLERY_URL} …")
        html = fetch_text(GALLERY_URL)
        HTML_PATH.write_text(html, encoding="utf-8")

    plates = parse_gallery(html)
    print(f"Parsed {len(plates)} <article> entries; deduplicating …")
    plates = deduplicate(plates)
    print(f"After dedupe: {len(plates)} unique plates")

    # Slug collisions: two plates with identical names get -2, -3 suffixes.
    slug_counts: dict[str, int] = {}
    for p in plates:
        if p["slug"] in slug_counts:
            slug_counts[p["slug"]] += 1
            p["slug"] = f"{p['slug']}-{slug_counts[p['slug']]}"
        else:
            slug_counts[p["slug"]] = 1

    print("Downloading images …")
    ok = 0
    for i, p in enumerate(plates, start=1):
        result = download_image(p)
        if result:
            ok += 1
        if i % 25 == 0:
            print(f"  {i}/{len(plates)} downloaded ({ok} ok)")
    print(f"Downloaded {ok}/{len(plates)} images")

    JSON_PATH.write_text(json.dumps(plates, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {JSON_PATH}")

    # Quick category breakdown for review
    from collections import Counter
    cat_counter: Counter[str] = Counter()
    for p in plates:
        for c in p["categories"]:
            cat_counter[c] += 1
    print("\nCategory breakdown:")
    for cat, count in cat_counter.most_common():
        print(f"  {cat:20} {count}")


if __name__ == "__main__":
    main()
