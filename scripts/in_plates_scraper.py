"""
Indiana BMV plate scraper.

Source: a single CSV that powers the four category-filtered HTML pages
(standard / college / military / organization). The page bootstraps a
small JS that loads PapaParse and parses this CSV client-side, so we can
just fetch it directly:
    https://www.in.gov/bmv/registration-plates/license-plates-overview/_plates-data.csv

Image URL pattern (from _plates.js):
    https://www.in.gov/bmv/registration-plates/images/plates/<plate_image_file>

Output:
    IN/in_plates_output/plates.csv         — verbatim CSV (cached)
    IN/in_plates_output/plates.json        — cleaned JSON for the importer
    IN/in_plates_output/images/<slug>.<ext> — downloaded plate art
"""
from __future__ import annotations

import csv
import html
import json
import re
import sys
import time
from pathlib import Path
from urllib.request import Request, urlopen

CSV_URL = "https://www.in.gov/bmv/registration-plates/license-plates-overview/_plates-data.csv"
IMAGE_BASE = "https://www.in.gov/bmv/registration-plates/images/plates/"
USER_AGENT = "every-pl8 importer (contact: bwise@mysagedental.com)"

OUTPUT_DIR = Path(__file__).resolve().parent / "in_plates_output"
CSV_PATH = OUTPUT_DIR / "plates.csv"
JSON_PATH = OUTPUT_DIR / "plates.json"
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
    return s.strip("-")


def clean_name(raw: str) -> str:
    """Strip HTML tags + decode entities + normalize whitespace.
    A handful of CSV rows include things like '<p>Alzheimer&rsquo;s
    Association</p>' or trailing '&nbsp;'."""
    text = re.sub(r"<[^>]+>", "", raw)
    text = html.unescape(text)
    text = text.replace("\xa0", " ")  # non-breaking space → regular space
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    if CSV_PATH.exists() and CSV_PATH.stat().st_size > 0:
        csv_text = CSV_PATH.read_text(encoding="utf-8")
        print(f"Reusing cached CSV ({CSV_PATH.stat().st_size} bytes)")
    else:
        print(f"Fetching {CSV_URL} …")
        csv_text = fetch_text(CSV_URL)
        CSV_PATH.write_text(csv_text, encoding="utf-8")

    rows = list(csv.DictReader(csv_text.splitlines()))
    print(f"Parsed {len(rows)} rows from CSV")

    # The page itself filters to display_online == 1 AND non-empty image file.
    # Also excludes 'Motorcycle' / 'Personalized' from the visible grid; we
    # follow the same convention (the CSV has none of those at the moment,
    # but be defensive).
    visible = [
        r for r in rows
        if r.get("display_online") == "1"
        and r.get("plate_image_file", "").strip()
        and r.get("top_level_category") not in ("Motorcycle", "Personalized")
    ]
    print(f"After display_online/image filter: {len(visible)} plates")

    plates = []
    slug_counts: dict[str, int] = {}
    for r in visible:
        name = clean_name(r["plate_product_name"])
        if not name:
            print(f"WARN: skipping row uid={r.get('plate_product_uid')} — empty name", file=sys.stderr)
            continue
        slug = slugify(name)
        if slug in slug_counts:
            slug_counts[slug] += 1
            slug = f"{slug}-{slug_counts[slug]}"
        else:
            slug_counts[slug] = 1

        image_filename = r["plate_image_file"].strip()
        image_url = IMAGE_BASE + image_filename

        plates.append({
            "scrape_id": r["plate_product_uid"].strip(),
            "name": name,
            "slug": slug,
            "category_dmv": r["top_level_category"].strip(),
            "group_fees": r["group_fees"].strip(),
            "admin_fees": r["admin_fees"].strip(),
            "personalization_fees": r["personalization_fees"].strip(),
            "renew_online": r["renew_online"].strip(),
            "eligibility": clean_name(r.get("eligibility", "")),
            "contact_info": clean_name(r.get("contact_info", "")),
            "availability": clean_name(r.get("availability", "")),
            "image_url": image_url,
            "image_filename": image_filename,
        })

    # Download images.
    print("Downloading images …")
    ok = 0
    for i, p in enumerate(plates, start=1):
        ext = Path(p["image_filename"]).suffix.lower() or ".jpg"
        target = IMAGES_DIR / f"{p['slug']}{ext}"
        if target.exists() and target.stat().st_size > 0:
            ok += 1
        else:
            try:
                target.write_bytes(fetch_bytes(p["image_url"]))
                ok += 1
            except Exception as exc:
                print(f"WARN: failed {p['name']!r}: {exc}", file=sys.stderr)
            time.sleep(0.05)
        if i % 25 == 0:
            print(f"  {i}/{len(plates)} ({ok} ok)")
    print(f"Downloaded {ok}/{len(plates)} images")

    JSON_PATH.write_text(json.dumps(plates, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {JSON_PATH}")

    from collections import Counter
    print("\nDMV category breakdown:")
    for cat, n in Counter(p["category_dmv"] for p in plates).most_common():
        print(f"  {cat:20} {n}")


if __name__ == "__main__":
    main()
