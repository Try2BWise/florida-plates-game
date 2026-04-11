#!/usr/bin/env python3
"""
Scrape Georgia specialty and standard license plate data from the official
Georgia Department of Revenue Motor Vehicle Division site and emit JSON files
that match the user's requested schema.

Strict mode rules implemented:
- Trust PlateSelection.aspx as the full universe of plates.
- Ignore any plates not listed on PlateSelection.aspx.
- Only create motorcycle variants when they are listed on PlateSelection.aspx.
- One plate code = one entry.
- Detail-page failures still yield stub entries using catalog data.

Dependencies:
    pip install requests beautifulsoup4

Usage:
    python georgia_plate_scraper.py
    python georgia_plate_scraper.py --batch-size 75
    python georgia_plate_scraper.py --output georgia-plate-master.json

Outputs:
- georgia-plate-master.json
- batch_001.json, batch_002.json, ...
- issues_report.json
"""
from __future__ import annotations

import argparse
import json
import random
import re
import sys
import time
import unicodedata
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import parse_qs, urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://mvd.dor.ga.gov/motor/plates/"
CATALOG_URL = urljoin(BASE_URL, "PlateSelection.aspx")
DETAIL_URL_TEMPLATE = urljoin(BASE_URL, "PlateDetails.aspx?PlateCode={code}")
IMAGE_URL_TEMPLATE = urljoin(BASE_URL, "images/2004/{code}_Large.jpg")
DEFAULT_OUTPUT = "georgia-plate-master.json"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
CATEGORY_VALUES = {
    "Civic",
    "Commercial",
    "First Responders",
    "Government",
    "Health",
    "Heritage",
    "Military",
    "Motorcycle",
    "Schools",
    "Sports",
    "Standard",
    "Universities",
    "Wildlife & Nature",
}

PRO_SPORTS_KEYWORDS = {
    "atlanta braves": ["braves", "baseball", "mlb"],
    "atlanta falcons": ["falcons", "football", "nfl"],
    "atlanta hawks": ["hawks", "basketball", "nba"],
    "atlanta united": ["atlanta united", "soccer", "mls"],
    "nascar": ["nascar", "racing", "motorsports"],
}

UNIVERSITY_ALIASES = {
    "georgia institute of technology": ["georgia tech", "gt", "yellow jackets", "yellowjackets"],
    "university of georgia": ["uga", "bulldogs"],
    "georgia southern university": ["georgia southern", "eagles"],
    "georgia state university": ["georgia state", "panthers"],
    "kennesaw state university": ["kennesaw state", "owls"],
    "valdosta state university": ["valdosta state", "blazers"],
    "fort valley state university": ["fort valley state", "wildcats"],
    "clark atlanta university": ["clark atlanta", "panthers"],
    "augusta university": ["augusta", "jaguars"],
    "emory university": ["emory", "eagles"],
    "mercer university": ["mercer", "bears"],
    "morehouse": ["morehouse", "maroon tigers", "maroon tigers"],
    "spelman college": ["spelman", "jaguars"],
    "mississippi state university alumni": ["mississippi state", "bulldogs"],
    "michigan state university": ["michigan state", "spartans"],
    "ohio state university alumni": ["ohio state", "buckeyes"],
    "florida state university-atlanta seminole club": ["florida state", "fsu", "seminoles"],
    "alabama a & m university plate": ["alabama a&m", "bulldogs"],
    "alabama state university plate": ["alabama state", "hornets"],
    "auburn club": ["auburn", "tigers"],
    "lsu alumni association - atlanta chapter": ["lsu", "tigers"],
    "university of miami": ["miami", "hurricanes"],
    "university of tennessee national alumni association": ["tennessee", "volunteers", "vols"],
    "university of north georgia": ["ung", "nighthawks"],
    "university of west georgia": ["west georgia", "uwg", "wolves"],
}

COLOR_TERMS = [
    "black", "blue", "bronze", "brown", "gold", "green", "maroon",
    "navy", "orange", "peach", "purple", "red", "silver", "white", "yellow",
]

MILITARY_KEYWORDS = [
    "air force", "army", "coast guard", "marine", "marines", "marine corps", "navy",
    "veteran", "veterans", "retired", "reserve", "national guard", "medal of honor",
    "bronze star", "silver star", "purple heart", "desert storm", "korean war",
    "vietnam", "global war on terrorism", "distinguished service", "legion of merit",
    "air medal", "ranger", "pow", "prisoner of war", "gold star family",
    "chosin", "allied veteran", "support our troops", "state defense force",
    "disabled veteran", "soldiers medal", "navy cross", "service medal",
]

FIRST_RESPONDER_KEYWORDS = [
    "firefighter", "firefighters", "first responder", "badge", "law enforcement",
    "emt", "emergency medical", "ambulance", "public safety", "lineman",
]

GOVERNMENT_KEYWORDS = [
    "legislators", "state parks", "dnr", "disabled person", "hobby antique", "prestige",
]

COMMERCIAL_KEYWORDS = [
    "ambulance", "hearse", "limousine", "low speed vehicle", "taxi", "trailer",
    "alternative fuel", "amateur radio", "mbohv", "multipurpose off-highway vehicle",
]

HEALTH_KEYWORDS = [
    "cancer", "healthcare", "health", "shepherd center", "lung", "sickle cell",
    "prostate", "sterilization", "children’s healthcare", "children's healthcare",
]

WILDLIFE_KEYWORDS = [
    "wild", "wildlife", "sea turtle", "dolphin", "marine habitat", "beekeepers",
    "agriculture", "forestry", "equine", "ducks unlimited", "appalachian trail",
    "parks", "pet foundation",
]

HERITAGE_KEYWORDS = [
    "historic", "historical", "masonic", "prince hall", "confederate", "rotary",
]

STANDARD_KEYWORDS = [
    "standard", "usa semiquincentennial", "america 250",
]

@dataclass
class CatalogPlate:
    name: str
    code: str
    detail_url: str
    discontinued_hint: bool


class ScrapeError(Exception):
    pass


class GeorgiaPlateScraper:
    def __init__(
        self,
        output_path: Path,
        batch_size: int = 75,
        delay_min: float = 1.0,
        delay_max: float = 2.0,
        timeout: int = 30,
    ) -> None:
        self.output_path = output_path
        self.batch_size = batch_size
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.timeout = timeout
        self.session = self._build_session()
        self.slug_counts: Dict[str, int] = {}
        self.catalog_name_to_id: Dict[str, str] = {}
        self.issues: Dict[str, List[Dict[str, Any]]] = {
            "broken_detail_pages": [],
            "slug_collisions": [],
            "category_ambiguities": [],
        }

    def _build_session(self) -> requests.Session:
        retry = Retry(
            total=5,
            read=5,
            connect=5,
            backoff_factor=1.0,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retry)
        session = requests.Session()
        session.headers.update({"User-Agent": USER_AGENT})
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        return session

    def sleep(self) -> None:
        time.sleep(random.uniform(self.delay_min, self.delay_max))

    def fetch(self, url: str) -> requests.Response:
        response = self.session.get(url, timeout=self.timeout)
        response.raise_for_status()
        return response

    def scrape(self) -> Dict[str, Any]:
        catalog = self.fetch_catalog()
        total = len(catalog)
        plates: List[Dict[str, Any]] = []

        for index, item in enumerate(catalog, start=1):
            print(f"[{index}/{total}] {item.code} — {item.name}")
            sys.stdout.flush()
            plate = self.fetch_plate_detail(item)
            plates.append(plate)
            self.catalog_name_to_id[self._normalize_name_for_lookup(plate["baseName"])] = plate["id"]
            if index < total:
                self.sleep()

        self._resolve_motorcycle_variants(plates)
        master = self._build_master_json(plates)
        self.write_master(master)
        self.write_batches(plates)
        self.write_issues_report()
        return master

    def fetch_catalog(self) -> List[CatalogPlate]:
        response = self.fetch(CATALOG_URL)
        soup = BeautifulSoup(response.text, "html.parser")
        links = soup.select("a[href*='PlateDetails.aspx?PlateCode=']")
        catalog: List[CatalogPlate] = []
        seen_codes = set()

        for link in links:
            href = link.get("href", "").strip()
            if not href:
                continue
            code = self._extract_plate_code(href)
            if not code or code in seen_codes:
                continue
            seen_codes.add(code)
            name = self._clean_whitespace(link.get_text(" ", strip=True))
            catalog.append(
                CatalogPlate(
                    name=name,
                    code=code,
                    detail_url=urljoin(CATALOG_URL, href),
                    discontinued_hint=self._looks_discontinued(name),
                )
            )

        if not catalog:
            raise ScrapeError("No plate links found on PlateSelection.aspx")
        return catalog

    def fetch_plate_detail(self, item: CatalogPlate) -> Dict[str, Any]:
        detail_data: Dict[str, Optional[str]] = {
            "detail_name": None,
            "manufacturing_fee": None,
            "annual_registration_fee": None,
            "annual_special_tag_fee": None,
            "where_funds_go": None,
            "additional_information": None,
            "special_qualifications": None,
        }
        page_issue = None

        try:
            response = self.fetch(item.detail_url)
            soup = BeautifulSoup(response.text, "html.parser")
            detail_data = self._parse_detail_page(soup)
        except Exception as exc:  # noqa: BLE001
            page_issue = str(exc)
            self.issues["broken_detail_pages"].append(
                {"code": item.code, "name": item.name, "detailUrl": item.detail_url, "error": page_issue}
            )

        return self._build_plate_entry(item, detail_data, page_issue)

    def _parse_detail_page(self, soup: BeautifulSoup) -> Dict[str, Optional[str]]:
        text_lines = [self._clean_whitespace(line) for line in soup.get_text("\n").splitlines()]
        text_lines = [line for line in text_lines if line]
        full_text = "\n".join(text_lines)

        result: Dict[str, Optional[str]] = {
            "detail_name": self._extract_detail_name(soup, text_lines),
            "manufacturing_fee": self._extract_prefixed_value(full_text, "Manufacturing Fee:"),
            "annual_registration_fee": self._extract_prefixed_value(full_text, "Annual Registration Fee:"),
            "annual_special_tag_fee": self._extract_prefixed_value(full_text, "Annual Special Tag Fee:"),
            "where_funds_go": self._extract_prefixed_value(full_text, "Where do the funds go?"),
            "additional_information": self._extract_section_after_marker(text_lines, "Additional Information:"),
            "special_qualifications": self._extract_prefixed_value(full_text, "Special Qualifications:"),
        }
        return result

    def _extract_detail_name(self, soup: BeautifulSoup, lines: List[str]) -> Optional[str]:
        for heading in soup.find_all(["h1", "h2", "h3"]):
            text = self._clean_whitespace(heading.get_text(" ", strip=True))
            if text and text.lower() != "plate details":
                return text
        for idx, line in enumerate(lines):
            if line.lower() == "plate details" and idx + 1 < len(lines):
                next_line = lines[idx + 1]
                if not next_line.lower().startswith("plate category code"):
                    return next_line
        return None

    def _extract_prefixed_value(self, full_text: str, prefix: str) -> Optional[str]:
        pattern = re.escape(prefix) + r"\s*(.+)"
        match = re.search(pattern, full_text)
        if match:
            value = match.group(1).strip()
            stop_tokens = [
                "Required Forms:",
                "Special Qualifications:",
                "Where do the funds go?",
                "Is the county name decal required?",
                "Sponsor's Website:",
                "Additional Information:",
            ]
            for token in stop_tokens:
                idx = value.find(token)
                if idx != -1:
                    value = value[:idx].strip()
            return value or None
        return None

    def _extract_section_after_marker(self, lines: List[str], marker: str) -> Optional[str]:
        lowered = [line.lower() for line in lines]
        marker_lower = marker.lower()
        if marker_lower not in lowered:
            return None
        start = lowered.index(marker_lower) + 1
        collected: List[str] = []
        end_markers = {"cost and fees distribution:", "georgia.gov logo department of revenue", "how can we help?", "quick links"}
        for line in lines[start:]:
            if line.lower() in end_markers:
                break
            collected.append(line)
        value = self._clean_whitespace(" ".join(collected))
        return value or None

    def _build_plate_entry(
        self,
        item: CatalogPlate,
        detail_data: Dict[str, Optional[str]],
        page_issue: Optional[str],
    ) -> Dict[str, Any]:
        catalog_name = item.name
        official_name = catalog_name
        variant_label = None
        plate_type = "passenger"
        category_notes: List[str] = []

        if self._is_motorcycle_name(catalog_name):
            variant_label = "Motorcycle"
            plate_type = "motorcycle"
            official_name = f"{self._base_name_from_motorcycle(catalog_name)} (Motorcycle)"

        base_name = self._derive_base_name(catalog_name, official_name)
        normalized_base = self._normalize_name_for_lookup(base_name)
        category = self._categorize_plate(catalog_name, base_name, plate_type, category_notes)
        if category not in CATEGORY_VALUES:
            raise ScrapeError(f"Unexpected category '{category}' for {item.code} {catalog_name}")

        discontinued = item.discontinued_hint or self._looks_discontinued(detail_data.get("detail_name")) or self._looks_discontinued(
            detail_data.get("additional_information")
        )
        is_current = not discontinued

        slug_base = self._slugify(official_name)
        slug, collision_note = self._unique_slug(slug_base)
        notes = self._build_notes(item, detail_data, is_current, category_notes, collision_note, page_issue)
        sponsor = self._extract_sponsor(detail_data)
        search_terms = self._build_search_terms(catalog_name, official_name, base_name, category, plate_type)

        entry = {
            "id": f"ga-{slug}",
            "slug": slug,
            "name": official_name,
            "displayName": official_name,
            "baseName": base_name,
            "variantLabel": variant_label,
            "plateType": plate_type,
            "isCurrent": is_current,
            "isActive": is_current,
            "category": category,
            "image": {
                "path": f"state-packs/georgia/plates/ga-{slug}.jpg",
                "remoteUrl": IMAGE_URL_TEMPLATE.format(code=item.code),
            },
            "sponsor": sponsor,
            "notes": notes,
            "searchTerms": search_terms,
            "variantOf": None,
            "relatedPlates": [],
            "metadataBlob": None,
            "sourceRefs": [
                {
                    "source": "Georgia DOR",
                    "sourceId": item.code,
                    "versionId": None,
                    "value": None,
                }
            ],
        }

        if category_notes:
            self.issues["category_ambiguities"].append(
                {
                    "code": item.code,
                    "name": official_name,
                    "category": category,
                    "notes": category_notes,
                }
            )

        return entry

    def _build_notes(
        self,
        item: CatalogPlate,
        detail_data: Dict[str, Optional[str]],
        is_current: bool,
        category_notes: List[str],
        collision_note: Optional[str],
        page_issue: Optional[str],
    ) -> Optional[str]:
        notes: List[str] = []
        if not is_current:
            notes.append("Discontinued / no longer available.")
        for label, key in [
            ("Manufacturing fee", "manufacturing_fee"),
            ("Annual registration fee", "annual_registration_fee"),
            ("Annual special tag fee", "annual_special_tag_fee"),
            ("Funds go to", "where_funds_go"),
            ("Special qualifications", "special_qualifications"),
            ("Additional information", "additional_information"),
        ]:
            value = detail_data.get(key)
            if value:
                notes.append(f"{label}: {value}")
        if page_issue:
            notes.append(f"Detail page fetch/parse issue: {page_issue}")
        if collision_note:
            notes.append(collision_note)
        notes.extend(category_notes)
        return " ".join(notes) if notes else None

    def _extract_sponsor(self, detail_data: Dict[str, Optional[str]]) -> Optional[str]:
        funds = detail_data.get("where_funds_go")
        if not funds:
            return None
        cleaned = funds.strip().rstrip(".")
        if cleaned.lower() in {"state treasury", "state of georgia general treasury"}:
            return None
        return cleaned

    def _build_search_terms(
        self,
        catalog_name: str,
        official_name: str,
        base_name: str,
        category: str,
        plate_type: str,
    ) -> List[str]:
        terms: List[str] = []
        candidates = {catalog_name, official_name, base_name}
        for value in candidates:
            if value:
                terms.append(value.lower())

        simplified = re.sub(r"[^a-z0-9]+", " ", official_name.lower()).strip()
        if simplified and simplified not in terms:
            terms.append(simplified)

        base_key = self._normalize_name_for_lookup(base_name)
        for uni_name, aliases in UNIVERSITY_ALIASES.items():
            if uni_name in base_key:
                terms.extend(aliases)

        for sports_name, aliases in PRO_SPORTS_KEYWORDS.items():
            if sports_name in base_key:
                terms.extend(aliases)

        for color in COLOR_TERMS:
            if color in official_name.lower() or color in base_name.lower():
                terms.append(color)

        if "peach" in official_name.lower() or category == "Standard":
            terms.append("peach")
        if plate_type == "motorcycle":
            terms.extend(["motorcycle", "bike"])
        if category == "Military":
            terms.extend([term for term in ["military", "veteran", "service"] if term not in terms])
        if category == "First Responders":
            terms.extend(["first responder", "public safety"])
        if category == "Wildlife & Nature":
            terms.extend(["nature", "wildlife"])
        if category == "Universities":
            terms.extend(["college", "university", "alumni"])
        if category == "Sports":
            terms.extend(["sports", "team"])
        if category == "Standard":
            terms.extend(["standard", "passenger"])

        deduped: List[str] = []
        seen = set()
        for term in terms:
            clean = self._clean_whitespace(term.lower())
            if not clean or clean in seen:
                continue
            seen.add(clean)
            deduped.append(clean)
        return deduped

    def _categorize_plate(
        self,
        catalog_name: str,
        base_name: str,
        plate_type: str,
        notes: List[str],
    ) -> str:
        name = f"{catalog_name} {base_name}".lower()

        if plate_type == "motorcycle":
            return "Motorcycle"

        if any(keyword in name for keyword in MILITARY_KEYWORDS):
            return "Military"

        if any(keyword in name for keyword in FIRST_RESPONDER_KEYWORDS):
            return "First Responders"

        if any(keyword in name for keyword in STANDARD_KEYWORDS):
            return "Standard"

        if self._is_university_plate(name):
            return "Universities"

        if self._is_professional_sports_plate(name):
            return "Sports"

        if any(keyword in name for keyword in COMMERCIAL_KEYWORDS):
            return "Commercial"

        if any(keyword in name for keyword in HEALTH_KEYWORDS):
            return "Health"

        if any(keyword in name for keyword in WILDLIFE_KEYWORDS):
            if any(token in name for token in ["foundation", "association", "conservancy"]):
                notes.append("Category ambiguity resolved to Wildlife & Nature based on plate intent rather than sponsor type.")
            return "Wildlife & Nature"

        if any(keyword in name for keyword in HERITAGE_KEYWORDS):
            return "Heritage"

        if any(keyword in name for keyword in GOVERNMENT_KEYWORDS):
            notes.append("Category selected as Government based on official/state-administered plate intent.")
            return "Government"

        if any(keyword in name for keyword in ["school", "educators"]):
            return "Schools"

        if any(keyword in name for keyword in ["aquarium", "keep georgia beautiful"]):
            notes.append("Category ambiguity resolved to Civic per instruction for state-affiliated organizations.")
            return "Civic"

        return "Civic"

    def _is_university_plate(self, name: str) -> bool:
        university_tokens = [
            "university", "college", "alumni", "seminole club", "gator club", "clemson club",
            "ole miss", "samford", "morehouse", "spelman", "brenau", "berry", "oglethorpe",
            "morris brown", "tuskegee",
        ]
        return any(token in name for token in university_tokens)

    def _is_professional_sports_plate(self, name: str) -> bool:
        return any(token in name for token in ["atlanta braves", "atlanta falcons", "atlanta hawks", "atlanta united", "nascar"])

    def _resolve_motorcycle_variants(self, plates: List[Dict[str, Any]]) -> None:
        base_lookup = {
            self._normalize_name_for_lookup(plate["baseName"]): plate["id"]
            for plate in plates
            if plate["plateType"] == "passenger"
        }
        for plate in plates:
            if plate["plateType"] != "motorcycle":
                continue
            base_key = self._normalize_name_for_lookup(plate["baseName"])
            parent_id = base_lookup.get(base_key)
            if parent_id:
                plate["variantOf"] = parent_id

    def _build_master_json(self, plates: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "schemaVersion": 2,
            "state": "Georgia",
            "generatedDate": date.today().isoformat(),
            "description": "Georgia plate master — sourced from Georgia Department of Revenue MVD",
            "sourceFiles": [CATALOG_URL],
            "plates": plates,
        }

    def write_master(self, payload: Dict[str, Any]) -> None:
        self.output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    def write_batches(self, plates: List[Dict[str, Any]]) -> None:
        out_dir = self.output_path.parent
        for batch_index, start in enumerate(range(0, len(plates), self.batch_size), start=1):
            batch_plates = plates[start:start + self.batch_size]
            batch_payload = {
                "schemaVersion": 2,
                "state": "Georgia",
                "generatedDate": date.today().isoformat(),
                "description": "Georgia plate master — sourced from Georgia Department of Revenue MVD",
                "sourceFiles": [CATALOG_URL],
                "plates": batch_plates,
            }
            batch_path = out_dir / f"batch_{batch_index:03d}.json"
            batch_path.write_text(json.dumps(batch_payload, indent=2, ensure_ascii=False), encoding="utf-8")

    def write_issues_report(self) -> None:
        issues_path = self.output_path.parent / "issues_report.json"
        issues_path.write_text(json.dumps(self.issues, indent=2, ensure_ascii=False), encoding="utf-8")

    def _extract_plate_code(self, href: str) -> Optional[str]:
        parsed = urlparse(href)
        qs = parse_qs(parsed.query)
        code = qs.get("PlateCode", [None])[0]
        if code:
            return code.strip()
        match = re.search(r"PlateCode=([A-Za-z0-9]{2,})", href)
        return match.group(1).strip() if match else None

    def _looks_discontinued(self, value: Optional[str]) -> bool:
        if not value:
            return False
        lowered = value.lower()
        return "no longer available" in lowered or "discontinued" in lowered

    def _clean_whitespace(self, value: str) -> str:
        return re.sub(r"\s+", " ", value).strip()

    def _is_motorcycle_name(self, name: str) -> bool:
        return "motorcycle" in name.lower()

    def _base_name_from_motorcycle(self, name: str) -> str:
        base = re.sub(r"\s*-\s*motorcycle\s*$", "", name, flags=re.IGNORECASE).strip()
        base = re.sub(r"\s+motorcycle\s*-\s*motorcycle\s*$", "", base, flags=re.IGNORECASE).strip()
        return base

    def _derive_base_name(self, catalog_name: str, official_name: str) -> str:
        if self._is_motorcycle_name(catalog_name):
            return self._base_name_from_motorcycle(catalog_name)
        return official_name

    def _slugify(self, value: str) -> str:
        normalized = unicodedata.normalize("NFKD", value)
        ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
        ascii_only = ascii_only.replace("&", " and ")
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_only.lower()).strip("-")
        slug = re.sub(r"-{2,}", "-", slug)
        return slug

    def _unique_slug(self, base_slug: str) -> Tuple[str, Optional[str]]:
        count = self.slug_counts.get(base_slug, 0)
        if count == 0:
            self.slug_counts[base_slug] = 1
            return base_slug, None
        self.slug_counts[base_slug] = count + 1
        new_slug = f"{base_slug}-{count}"
        note = f"Slug collision resolved: '{base_slug}' already existed, assigned '{new_slug}'."
        self.issues["slug_collisions"].append({"baseSlug": base_slug, "resolvedSlug": new_slug})
        return new_slug, note

    def _normalize_name_for_lookup(self, value: str) -> str:
        simplified = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
        simplified = simplified.lower()
        simplified = re.sub(r"\(motorcycle\)", "", simplified)
        simplified = re.sub(r"\bnew design\b", "", simplified)
        simplified = re.sub(r"\bplate\b", "", simplified)
        simplified = re.sub(r"\balumni association\b", "alumni", simplified)
        simplified = re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", simplified)).strip()
        return simplified


def parse_args(argv: Optional[Iterable[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape Georgia DOR license plate catalog into JSON.")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Path to master JSON output file.")
    parser.add_argument("--batch-size", type=int, default=75, help="Number of plates per batch JSON file.")
    parser.add_argument("--delay-min", type=float, default=1.0, help="Minimum polite delay between detail requests.")
    parser.add_argument("--delay-max", type=float, default=2.0, help="Maximum polite delay between detail requests.")
    parser.add_argument("--timeout", type=int, default=30, help="HTTP timeout in seconds.")
    return parser.parse_args(list(argv) if argv is not None else None)


def main(argv: Optional[Iterable[str]] = None) -> int:
    args = parse_args(argv)
    if args.batch_size <= 0:
        print("--batch-size must be > 0", file=sys.stderr)
        return 2
    if args.delay_min < 0 or args.delay_max < 0 or args.delay_max < args.delay_min:
        print("Delay settings are invalid.", file=sys.stderr)
        return 2

    scraper = GeorgiaPlateScraper(
        output_path=Path(args.output).resolve(),
        batch_size=args.batch_size,
        delay_min=args.delay_min,
        delay_max=args.delay_max,
        timeout=args.timeout,
    )
    try:
        payload = scraper.scrape()
    except Exception as exc:  # noqa: BLE001
        print(f"Scrape failed: {exc}", file=sys.stderr)
        return 1

    print(f"Done. Wrote {len(payload['plates'])} plates to {scraper.output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
