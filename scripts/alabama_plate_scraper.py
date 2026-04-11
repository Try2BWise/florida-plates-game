#!/usr/bin/env python3
"""Scrape Alabama license plates via the WP REST API.

The Alabama DOR site at revenue.alabama.gov uses WordPress with a
custom post type 'license-plates' that is exposed via the REST API.
No HTML scraping needed — all data comes from structured JSON.

Usage:
    python scripts/alabama_plate_scraper.py --output src/data/alabama-plate-master.json

Dependencies:
    pip install requests
"""
import argparse
import json
import re
import sys
import time
import unicodedata
from datetime import date
from html import unescape
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

API_URL = "https://www.revenue.alabama.gov/wp-json/wp/v2/license-plates"
PER_PAGE = 50

CATEGORIES = {
    "Civic", "Commercial", "First Responders", "Government", "Health",
    "Heritage", "Military", "Motorcycle", "Schools", "Sports",
    "Standard", "Universities", "Wildlife & Nature",
}

MILITARY_KEYWORDS = [
    "air force", "army", "coast guard", "marine", "navy", "veteran",
    "national guard", "medal", "bronze star", "silver star", "purple heart",
    "pow", "prisoner of war", "gold star", "combat", "desert storm",
    "vietnam", "korea", "wwii", "world war", "disabled veteran",
    "legion of merit", "distinguished", "meritorious", "armed forces",
]

UNIVERSITY_KEYWORDS = [
    "university", "college", "auburn", "alabama a&m", "alabama state",
    "troy", "uab", "samford", "jacksonville state", "tuskegee",
    "stillman", "miles", "spring hill", "huntingdon", "montevallo",
    "birmingham-southern", "faulkner",
]

PRO_SPORTS_KEYWORDS = [
    "nascar", "birmingham stallions", "birmingham barons",
    "montgomery biscuits", "rocket city trash pandas",
    "birmingham legion",
]

FIRST_RESPONDER_KEYWORDS = [
    "firefighter", "fire department", "law enforcement", "police",
    "emt", "paramedic", "emergency medical", "first responder",
    "fraternal order of police", "sheriff",
]

WILDLIFE_KEYWORDS = [
    "wildlife", "conservation", "quail", "deer", "bass", "fish",
    "forever wild", "nature", "outdoors", "hunting", "fishing",
    "audubon", "ducks unlimited",
]

HERITAGE_KEYWORDS = [
    "historic", "heritage", "antique", "confederate", "masonic",
    "sons of confederate",
]

HEALTH_KEYWORDS = [
    "cancer", "autism", "healthcare", "health", "hospital",
    "children's", "mental health",
]


def build_session() -> requests.Session:
    retry = Retry(total=5, backoff_factor=1.0,
                  status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    s = requests.Session()
    s.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })
    s.mount("https://", adapter)
    return s


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    value = re.sub(r"-{2,}", "-", value)
    return value


def clean_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def categorize(name: str, wp_categories: List[str]) -> Tuple[str, Optional[str]]:
    lower = name.lower()
    note = None

    if "motorcycle" in lower:
        return "Motorcycle", None

    if any(kw in lower for kw in MILITARY_KEYWORDS):
        if "sons of confederate" in lower or "confederate veterans" in lower:
            return "Heritage", "Confederate veterans org -> Heritage per policy"
        return "Military", None

    if any(kw in lower for kw in FIRST_RESPONDER_KEYWORDS):
        return "First Responders", None

    if any(kw in lower for kw in UNIVERSITY_KEYWORDS):
        return "Universities", None

    if any(kw in lower for kw in PRO_SPORTS_KEYWORDS):
        return "Sports", None

    if any(kw in lower for kw in HEALTH_KEYWORDS):
        return "Health", None

    if any(kw in lower for kw in WILDLIFE_KEYWORDS):
        return "Wildlife & Nature", None

    if any(kw in lower for kw in HERITAGE_KEYWORDS):
        return "Heritage", None

    if any(kw in lower for kw in ["standard", "passenger", "truck", "trailer",
                                   "motor home", "disabled person"]):
        return "Standard", None

    if any(kw in lower for kw in ["taxi", "ambulance", "hearse", "limousine",
                                   "wrecker", "dealer", "forest product",
                                   "amateur radio", "ham radio"]):
        return "Commercial", None

    if any(kw in lower for kw in ["government", "legislat", "official",
                                   "state of alabama", "prestige"]):
        return "Government", None

    if any(kw in lower for kw in ["school", "educator", "education"]):
        return "Schools", None

    note = f"Category ambiguity: defaulted to Civic for '{name}'"
    return "Civic", note


def build_search_terms(name: str, category: str) -> List[str]:
    terms = set()
    name_lower = name.lower()

    if "crimson tide" in name_lower or ("university of alabama" in name_lower and "birmingham" not in name_lower):
        terms.update(["bama", "crimson tide", "roll tide"])
    if "auburn" in name_lower:
        terms.update(["war eagle", "tigers"])
    if "uab" in name_lower or ("alabama" in name_lower and "birmingham" in name_lower):
        terms.update(["uab", "blazers"])
    if "troy" in name_lower and "university" in name_lower:
        terms.add("trojans")
    if "alabama a&m" in name_lower:
        terms.update(["aamu", "bulldogs"])
    if "jacksonville state" in name_lower:
        terms.add("gamecocks")
    if "tuskegee" in name_lower:
        terms.update(["golden tigers"])
    if "samford" in name_lower:
        terms.add("bulldogs")

    # Exclude plate name and category words
    cat_words = set()
    for cat in CATEGORIES:
        cat_words.add(cat.lower())
        for w in cat.lower().replace("&", "").split():
            if w:
                cat_words.add(w)
    cat_words.update(["university", "college", "alumni", "veteran",
                      "military", "motorcycle", "wildlife", "nature",
                      "sports", "standard", "heritage", "government",
                      "health", "schools", "civic", "commercial", "service"])

    name_simplified = re.sub(r"[^a-z0-9]+", " ", name_lower).strip()
    skip = cat_words | {name_lower, name_simplified}

    return sorted(t for t in terms if t not in skip)


def fetch_all_plates(session: requests.Session) -> List[Dict[str, Any]]:
    all_plates = []
    page = 1

    while True:
        url = f"{API_URL}?per_page={PER_PAGE}&page={page}&_embed&orderby=title&order=asc"
        resp = session.get(url, timeout=30)

        if resp.status_code == 400:
            break

        resp.raise_for_status()
        plates = resp.json()

        if not plates:
            break

        total = resp.headers.get("X-WP-Total", "?")
        total_pages = resp.headers.get("X-WP-TotalPages", "?")

        for p in plates:
            all_plates.append(p)

        print(f"  Page {page}/{total_pages} - {len(all_plates)}/{total} plates")
        sys.stdout.flush()

        page += 1
        time.sleep(1.0)

    return all_plates


def process_plate(wp_plate: Dict[str, Any], slug_counts: Dict[str, int],
                  issues: Dict[str, List]) -> Dict[str, Any]:
    name = clean_html(wp_plate["title"]["rendered"])
    name = re.sub(r"\s*\(?\s*(discontinued|no longer available|retired)\s*\)?\s*$",
                  "", name, flags=re.I).strip()

    wp_cats = []
    for term_group in wp_plate.get("_embedded", {}).get("wp:term", []):
        for term in term_group:
            wp_cats.append(term.get("name", ""))

    image_url = None
    media = wp_plate.get("_embedded", {}).get("wp:featuredmedia", [])
    if media and media[0]:
        sizes = media[0].get("media_details", {}).get("sizes", {})
        if "medium" in sizes:
            image_url = sizes["medium"].get("source_url")
        elif "large" in sizes:
            image_url = sizes["large"].get("source_url")
        else:
            image_url = media[0].get("source_url")

    plate_type = "passenger"
    variant_label = None
    base_name = name
    if "motorcycle" in name.lower():
        plate_type = "motorcycle"
        variant_label = "Motorcycle"
        base_name = re.sub(r"\s*\(?\s*motorcycle\s*\)?\s*$", "", name, flags=re.I).strip()
        if not name.lower().endswith("(motorcycle)"):
            name = f"{base_name} (Motorcycle)"

    category, cat_note = categorize(name, wp_cats)

    content = clean_html(wp_plate.get("content", {}).get("rendered", ""))
    is_discontinued = any(kw in content.lower() for kw in
                         ["no longer available", "discontinued", "retired"])

    slug_base = slugify(name)
    count = slug_counts.get(slug_base, 0)
    if count > 0:
        slug = f"{slug_base}-{count}"
        issues["slug_collisions"].append({"base": slug_base, "resolved": slug})
    else:
        slug = slug_base
    slug_counts[slug_base] = count + 1

    search_terms = build_search_terms(name, category)

    notes = cat_note if cat_note else None
    if cat_note:
        issues["category_ambiguities"].append({
            "name": name, "category": category, "note": cat_note
        })

    return {
        "id": f"al-{slug}",
        "slug": slug,
        "name": name,
        "displayName": name,
        "baseName": base_name,
        "variantLabel": variant_label,
        "plateType": plate_type,
        "isCurrent": not is_discontinued,
        "isActive": not is_discontinued,
        "category": category,
        "image": {
            "path": f"state-packs/alabama/plates/al-{slug}.jpg",
            "remoteUrl": image_url,
        },
        "sponsor": None,
        "notes": notes,
        "searchTerms": search_terms,
        "variantOf": None,
        "relatedPlates": [],
        "metadataBlob": None,
        "sourceRefs": [{
            "source": "Alabama DOR",
            "sourceId": wp_plate.get("slug", slug),
            "versionId": None,
            "value": None,
        }],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="alabama-plate-master.json")
    args = parser.parse_args()

    session = build_session()
    print("Fetching Alabama plates via WP REST API...")
    wp_plates = fetch_all_plates(session)
    print(f"\nFetched {len(wp_plates)} plates. Processing...")

    slug_counts: Dict[str, int] = {}
    issues: Dict[str, List] = {
        "slug_collisions": [],
        "category_ambiguities": [],
        "missing_images": [],
    }

    entries = []
    for i, wp in enumerate(wp_plates, 1):
        entry = process_plate(wp, slug_counts, issues)
        entries.append(entry)
        if i % 50 == 0:
            print(f"  [{i}/{len(wp_plates)}] {entry['name']}")

    # Link motorcycle variants
    passenger_lookup = {e["baseName"].lower(): e["id"]
                        for e in entries if e["plateType"] == "passenger"}
    for e in entries:
        if e["plateType"] == "motorcycle":
            parent = passenger_lookup.get(e["baseName"].lower())
            if parent:
                e["variantOf"] = parent

    for e in entries:
        if not e["image"]["remoteUrl"]:
            issues["missing_images"].append(e["id"])

    master = {
        "schemaVersion": 2,
        "state": "Alabama",
        "generatedDate": date.today().isoformat(),
        "description": "Alabama plate master — sourced from Alabama Department of Revenue",
        "sourceFiles": [API_URL],
        "plates": entries,
    }

    out = Path(args.output)
    out.write_text(json.dumps(master, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {len(entries)} plates to {out}")

    issues_path = out.parent / "alabama-issues-report.json"
    issues_path.write_text(json.dumps(issues, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Issues: {sum(len(v) for v in issues.values())} total -> {issues_path}")

    cats: Dict[str, int] = {}
    for e in entries:
        cats[e["category"]] = cats.get(e["category"], 0) + 1
    print("\nCategory breakdown:")
    for c, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
