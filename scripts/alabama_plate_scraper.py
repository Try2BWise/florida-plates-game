#!/usr/bin/env python3
"""
Alabama specialty plate scraper

Scrapes the official Alabama Department of Revenue license plate archive and writes
alabama-plate-master.json in the current directory.

Design goals:
- Requests + BeautifulSoup only
- Robust against deeply nested Elementor wrappers
- Parses plate entries by walking document order rather than brittle sibling chains
- Includes retries, polite delays, progress logging, and an issues summary
"""

from __future__ import annotations

import json
import random
import re
import sys
import time
from collections import Counter
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, Iterable, List, Optional, Sequence, Tuple
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, NavigableString, Tag

BASE_URL = "https://www.revenue.alabama.gov/license-plates/"
PAGE_URL = "https://www.revenue.alabama.gov/license-plates/page/{page}/"
OUTPUT_FILE = "alabama-plate-master.json"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
REQUEST_TIMEOUT = 30
MAX_RETRIES = 4
DELAY_RANGE_SECONDS = (1.0, 2.0)

DISCONTINUED_PATTERNS = (
    "no longer available",
    "discontinued",
    "retired",
    "not currently available",
    "no longer issued",
)

DETAIL_HEADINGS = {
    "issued to": "issued_to",
    "code section": "code_section",
    "required documents": "required_documents",
    "registration fees": "registration_fees",
    "other information": "other_information",
}

NON_PLATE_H3 = {
    "search by title",
    "search by type",
}

STANDARD_HEADERS = {
    "homepage",
    "license plates",
    "results",
    "services",
}

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


@dataclass
class PlateRecord:
    name: str
    image_url: Optional[str] = None
    issued_to: str = ""
    code_section: str = ""
    required_documents: str = ""
    registration_fees: str = ""
    other_information: str = ""
    page_number: Optional[int] = None
    notes: Optional[str] = None
    source_id: Optional[str] = None
    debug_text: str = ""


@dataclass
class ScrapeIssues:
    missing_images: List[str] = field(default_factory=list)
    slug_collisions: List[str] = field(default_factory=list)
    category_ambiguities: List[str] = field(default_factory=list)
    stub_entries: List[str] = field(default_factory=list)


class AlabamaPlateScraper:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})
        self.issues = ScrapeIssues()

    def run(self) -> Dict[str, object]:
        plates = self.scrape_all_pages()
        if not plates:
            raise RuntimeError(
                "No records extracted. The site structure may have changed or the "
                "page content may not be present in the downloaded HTML."
            )

        json_plates = self.build_json_plates(plates)
        payload = {
            "schemaVersion": 2,
            "state": "Alabama",
            "generatedDate": date.today().isoformat(),
            "description": "Alabama plate master — sourced from Alabama Department of Revenue",
            "sourceFiles": [BASE_URL],
            "plates": json_plates,
        }
        return payload

    def scrape_all_pages(self) -> List[PlateRecord]:
        all_records: List[PlateRecord] = []
        seen_names: Counter[str] = Counter()
        empty_pages = 0
        total_expected = None

        for page_number in range(1, 30):
            url = BASE_URL if page_number == 1 else PAGE_URL.format(page=page_number)
            soup = self.fetch_soup(url)
            if total_expected is None:
                total_expected = self.extract_total_expected(soup)
                if total_expected:
                    print(f"Detected catalog size: {total_expected} plates")

            records = self.extract_plate_records_from_page(soup, page_number)
            if not records:
                empty_pages += 1
                print(f"[page {page_number}] no records found")
                if empty_pages >= 2:
                    break
                continue

            empty_pages = 0
            new_records = 0
            for record in records:
                normalized = self.normalize_whitespace(record.name).lower()
                seen_names[normalized] += 1
                if seen_names[normalized] == 1:
                    all_records.append(record)
                    new_records += 1

            print(f"[page {page_number}] extracted {len(records)} records ({new_records} new)")

            if total_expected and len(all_records) >= total_expected:
                break

            self.polite_delay()

        return all_records

    def fetch_soup(self, url: str) -> BeautifulSoup:
        last_error: Optional[Exception] = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = self.session.get(url, timeout=REQUEST_TIMEOUT)
                response.raise_for_status()
                return BeautifulSoup(response.text, "html.parser")
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                wait = min(2 ** attempt, 10) + random.uniform(0.2, 0.8)
                print(f"Request failed ({attempt}/{MAX_RETRIES}) for {url}: {exc}", file=sys.stderr)
                time.sleep(wait)
        raise RuntimeError(f"Unable to fetch {url}: {last_error}")

    def extract_total_expected(self, soup: BeautifulSoup) -> Optional[int]:
        text = soup.get_text("\n", strip=True)
        match = re.search(r"Showing\s+\d+\s+of\s+(\d+)\s+Plates", text, flags=re.I)
        if match:
            return int(match.group(1))
        return None

    def extract_plate_records_from_page(self, soup: BeautifulSoup, page_number: int) -> List[PlateRecord]:
        headings = self.find_plate_headings(soup)
        records: List[PlateRecord] = []

        for heading in headings:
            record = self.extract_record_from_heading(heading, page_number)
            if record:
                records.append(record)

        return records

    def find_plate_headings(self, soup: BeautifulSoup) -> List[Tag]:
        candidates = []
        for h3 in soup.find_all("h3"):
            name = self.normalize_whitespace(h3.get_text(" ", strip=True))
            if not name:
                continue
            lowered = name.lower()
            if lowered in NON_PLATE_H3 or lowered in STANDARD_HEADERS:
                continue
            if len(name) < 3:
                continue
            if not self.looks_like_plate_heading(h3, name):
                continue
            candidates.append(h3)

        return candidates

    def looks_like_plate_heading(self, h3: Tag, name: str) -> bool:
        lowered = name.lower()
        if lowered in STANDARD_HEADERS:
            return False

        # Use forward traversal in document order, not sibling traversal.
        texts = []
        h5_seen = 0
        for node in h3.next_elements:
            if node is h3:
                continue
            if isinstance(node, Tag) and node.name == "h3":
                break
            if isinstance(node, Tag) and node.name in {"h4", "h5"}:
                heading_text = self.normalize_whitespace(node.get_text(" ", strip=True)).rstrip(":").lower()
                if heading_text in DETAIL_HEADINGS:
                    h5_seen += 1
            if len(texts) < 6 and isinstance(node, NavigableString):
                value = self.normalize_whitespace(str(node))
                if value:
                    texts.append(value)
            if h5_seen >= 2:
                break

        joined = " ".join(texts).lower()
        return (
            h5_seen >= 1
            or "issued to" in joined
            or "registration fees" in joined
            or "code section" in joined
            or "open" in joined
        )

    def extract_record_from_heading(self, h3: Tag, page_number: int) -> Optional[PlateRecord]:
        name = self.clean_plate_name(h3.get_text(" ", strip=True))
        if not name:
            return None

        detail_map, raw_text = self.extract_detail_sections(h3)
        image_url = self.find_image_for_heading(h3)

        issued_to = detail_map.get("issued_to", "")
        code_section = detail_map.get("code_section", "")
        required_documents = detail_map.get("required_documents", "")
        registration_fees = detail_map.get("registration_fees", "")
        other_information = detail_map.get("other_information", "")

        record = PlateRecord(
            name=name,
            image_url=image_url,
            issued_to=issued_to,
            code_section=code_section,
            required_documents=required_documents,
            registration_fees=registration_fees,
            other_information=other_information,
            page_number=page_number,
            source_id=self.slugify(name),
            debug_text=raw_text,
        )

        if not image_url:
            self.issues.missing_images.append(name)

        if not any([issued_to, code_section, required_documents, registration_fees, other_information]):
            record.notes = "Detail section unavailable on source page; created stub from catalog entry."
            self.issues.stub_entries.append(name)

        return record

    def extract_detail_sections(self, h3: Tag) -> Tuple[Dict[str, str], str]:
        detail_map: Dict[str, List[str]] = {value: [] for value in DETAIL_HEADINGS.values()}
        current_key: Optional[str] = None
        raw_chunks: List[str] = []

        for node in h3.next_elements:
            if node is h3:
                continue
            if isinstance(node, Tag) and node.name == "h3":
                break

            if isinstance(node, Tag) and node.name in {"h4", "h5"}:
                heading_text = self.normalize_whitespace(node.get_text(" ", strip=True)).rstrip(":").lower()
                mapped = DETAIL_HEADINGS.get(heading_text)
                if mapped:
                    current_key = mapped
                    continue

            if isinstance(node, Tag):
                if node.name in {"script", "style", "noscript"}:
                    continue
                if node.name in {"p", "li", "div", "span"}:
                    text = self.normalize_whitespace(node.get_text(" ", strip=True))
                    if not text:
                        continue
                    if text.lower() == "open":
                        continue
                    raw_chunks.append(text)
                    if current_key:
                        detail_map[current_key].append(text)

        collapsed = {k: self.collapse_text(v) for k, v in detail_map.items()}
        raw_text = self.collapse_text(raw_chunks)
        return collapsed, raw_text

    def find_image_for_heading(self, h3: Tag) -> Optional[str]:
        # 1) Prefer an image in the heading's nearest meaningful container.
        container = self.find_nearest_container_with_image(h3)
        if container:
            img = self.pick_best_image(container)
            if img:
                return img

        # 2) Walk backward through document order to find the listing thumbnail.
        for node in h3.previous_elements:
            if isinstance(node, Tag) and node.name == "h3":
                break
            if isinstance(node, Tag) and node.name == "img":
                url = self.get_img_url(node)
                if url:
                    return url

        # 3) Last-chance forward scan before next h3.
        for node in h3.next_elements:
            if node is h3:
                continue
            if isinstance(node, Tag) and node.name == "h3":
                break
            if isinstance(node, Tag) and node.name == "img":
                url = self.get_img_url(node)
                if url:
                    return url

        return None

    def find_nearest_container_with_image(self, node: Tag) -> Optional[Tag]:
        for parent in node.parents:
            if not isinstance(parent, Tag):
                continue
            if parent.find("img") and parent.find("h3"):
                return parent
        return None

    def pick_best_image(self, container: Tag) -> Optional[str]:
        images = container.find_all("img")
        for img in images:
            url = self.get_img_url(img)
            if url:
                return url
        return None

    def get_img_url(self, img: Tag) -> Optional[str]:
        for attr in ("src", "data-src", "data-lazy-src"):
            candidate = img.get(attr)
            if candidate and isinstance(candidate, str):
                candidate = candidate.strip()
                if candidate and not candidate.startswith("data:"):
                    return urljoin(BASE_URL, candidate)
        srcset = img.get("srcset") or img.get("data-srcset")
        if srcset:
            first = srcset.split(",")[0].strip().split(" ")[0]
            if first:
                return urljoin(BASE_URL, first)
        return None

    def build_json_plates(self, records: Sequence[PlateRecord]) -> List[Dict[str, object]]:
        output: List[Dict[str, object]] = []
        slug_counts: Counter[str] = Counter()
        pending_motorcycles: List[Tuple[Dict[str, object], str]] = []

        for index, record in enumerate(records, start=1):
            is_current = not self.text_implies_discontinued(self.combine_record_text(record))
            plate_type = self.detect_plate_type(record)
            category, category_note = self.categorize_plate(record, plate_type)
            sponsor = self.extract_sponsor(record)
            search_terms = self.build_search_terms(record)
            base_name = record.name
            variant_label = None
            display_name = record.name

            if plate_type == "motorcycle":
                category = "Motorcycle"
                variant_label = "Motorcycle"
                display_name = f"{record.name} (Motorcycle)"

            slug_base = self.slugify(display_name)
            slug = slug_base
            slug_counts[slug_base] += 1
            if slug_counts[slug_base] > 1:
                slug = f"{slug_base}-{slug_counts[slug_base]}"
                self.issues.slug_collisions.append(f"{slug_base} -> {slug}")

            if category_note:
                notes = category_note if not record.notes else f"{record.notes} {category_note}".strip()
            else:
                notes = record.notes

            entry: Dict[str, object] = {
                "id": f"al-{slug}",
                "slug": slug,
                "name": display_name,
                "displayName": display_name,
                "baseName": base_name,
                "variantLabel": variant_label,
                "plateType": plate_type,
                "isCurrent": is_current,
                "isActive": is_current,
                "category": category,
                "image": {
                    "path": f"state-packs/alabama/plates/al-{slug}.jpg",
                    "remoteUrl": record.image_url,
                },
                "sponsor": sponsor,
                "notes": notes or None,
                "searchTerms": search_terms,
                "variantOf": None,
                "relatedPlates": [],
                "metadataBlob": {
                    "issuedTo": record.issued_to or None,
                    "codeSection": record.code_section or None,
                    "requiredDocuments": record.required_documents or None,
                    "registrationFees": record.registration_fees or None,
                    "otherInformation": record.other_information or None,
                    "pageNumber": record.page_number,
                },
                "sourceRefs": [
                    {
                        "source": "Alabama DOR",
                        "sourceId": record.source_id or slug,
                        "versionId": None,
                        "value": None,
                    }
                ],
            }

            if plate_type == "motorcycle":
                pending_motorcycles.append((entry, base_name))

            output.append(entry)
            print(f"[{index}/{len(records)}] {display_name}")

        # Link motorcycle variants to passenger versions when possible.
        base_to_id = {
            item["baseName"]: item["id"]
            for item in output
            if item["plateType"] == "passenger"
        }
        for entry, base_name in pending_motorcycles:
            parent_id = base_to_id.get(base_name)
            if parent_id:
                entry["variantOf"] = parent_id

        return output

    def detect_plate_type(self, record: PlateRecord) -> str:
        haystack = self.combine_record_text(record).lower()
        if "motorcycle" in haystack:
            return "motorcycle"
        return "passenger"

    def categorize_plate(self, record: PlateRecord, plate_type: str) -> Tuple[str, Optional[str]]:
        if plate_type == "motorcycle":
            return "Motorcycle", None

        haystack = self.combine_record_text(record).lower()
        name = record.name.lower()

        military_terms = [
            "veteran", "veterans", "armed forces", "military", "purple heart", "medal",
            "army", "navy", "air force", "marine", "marines", "coast guard", "national guard",
            "pow", "mia", "combat", "bronze star", "silver star", "distinguished service",
            "disabled veteran",
        ]
        if any(term in haystack for term in military_terms):
            return "Military", None

        university_terms = [
            "university", "college", "auburn", "alabama a&m", "ua", "uab", "troy", "jaguars",
            "crimson tide", "blazers", "bulldogs", "hornets", "wildcats", "tigers",
        ]
        if any(term in haystack for term in university_terms):
            return "Universities", None

        pro_sports_terms = ["nascar", "barons", "stallions", "professional"]
        if any(term in haystack for term in pro_sports_terms):
            return "Sports", None

        if any(term in haystack for term in ["police", "firefighter", "fire department", "first responder", "ems", "rescue"]):
            return "First Responders", None

        if any(term in haystack for term in ["health", "hospital", "breast cancer", "autism", "children's", "diabetes"]):
            return "Health", None

        if any(term in haystack for term in ["wildlife", "nature", "forest", "deer", "outdoors", "conservation"]):
            return "Wildlife & Nature", None

        if any(term in haystack for term in ["antique", "historic", "vintage"]):
            return "Heritage", None

        if any(term in haystack for term in ["government", "official", "municipal", "county", "state", "public"]):
            return "Government", None

        if any(term in haystack for term in ["truck", "tractor", "trailer", "dealer", "manufacturer", "commercial", "farm"]):
            return "Commercial", None

        if "standard" in name or record.name in {"Standard Passenger", "Prestige", "Personalized Prestige"}:
            return "Standard", None

        note = "Category inferred as Civic because source text did not clearly match another allowed category."
        self.issues.category_ambiguities.append(record.name)
        return "Civic", note

    def extract_sponsor(self, record: PlateRecord) -> Optional[str]:
        text = " ".join(filter(None, [record.other_information, record.issued_to]))
        match = re.search(r"sponsor(?:ed)? by[:\s]+([^.;\n]+)", text, flags=re.I)
        if match:
            return self.normalize_whitespace(match.group(1))
        return None

    def build_search_terms(self, record: PlateRecord) -> List[str]:
        name = record.name.lower()
        text = self.combine_record_text(record).lower()
        terms = set()

        manual_map = {
            "university of alabama": ["bama", "crimson tide", "crimson", "elephant"],
            "auburn": ["tigers", "war eagle", "eagle", "orange", "blue"],
            "uab": ["blazers", "dragon", "green", "gold"],
            "alabama a&m": ["bulldogs", "maroon", "white"],
        }
        for key, values in manual_map.items():
            if key in name:
                terms.update(values)

        imagery_terms = [
            "flag", "eagle", "deer", "tree", "forest", "seal", "heart", "ribbon", "star",
            "cross", "badge", "shield", "camouflage",
        ]
        for term in imagery_terms:
            if term in text and term not in name:
                terms.add(term)

        abbrev_terms = {
            "university of alabama": "ua",
            "university of alabama at birmingham": "uab",
            "alabama a&m university": "aamu",
        }
        for key, value in abbrev_terms.items():
            if key in name:
                terms.add(value)

        colors = ["red", "blue", "green", "gold", "black", "white", "purple", "orange", "yellow", "silver"]
        for color in colors:
            if color in text and color not in name:
                terms.add(color)

        return sorted(terms)

    def combine_record_text(self, record: PlateRecord) -> str:
        return " ".join(
            part for part in [
                record.name,
                record.issued_to,
                record.code_section,
                record.required_documents,
                record.registration_fees,
                record.other_information,
                record.notes,
                record.debug_text,
            ]
            if part
        )

    def text_implies_discontinued(self, text: str) -> bool:
        lowered = text.lower()
        return any(pattern in lowered for pattern in DISCONTINUED_PATTERNS)

    @staticmethod
    def clean_plate_name(value: str) -> str:
        value = AlabamaPlateScraper.normalize_whitespace(value)
        value = re.sub(r"\s*\((?:discontinued|no longer available|retired)[^)]+\)$", "", value, flags=re.I)
        value = re.sub(r"\s+-\s+(?:discontinued|no longer available|retired).*$", "", value, flags=re.I)
        return value.strip()

    @staticmethod
    def normalize_whitespace(value: str) -> str:
        return re.sub(r"\s+", " ", value or "").strip()

    @staticmethod
    def collapse_text(parts: Iterable[str]) -> str:
        seen: List[str] = []
        for part in parts:
            normalized = AlabamaPlateScraper.normalize_whitespace(part)
            if not normalized:
                continue
            if seen and normalized == seen[-1]:
                continue
            seen.append(normalized)
        return " ".join(seen)

    @staticmethod
    def slugify(value: str) -> str:
        value = value.lower()
        value = re.sub(r"&", " and ", value)
        value = re.sub(r"[^a-z0-9]+", "-", value)
        value = re.sub(r"-+", "-", value).strip("-")
        return value

    @staticmethod
    def polite_delay() -> None:
        time.sleep(random.uniform(*DELAY_RANGE_SECONDS))


def write_json_file(payload: Dict[str, object], path: str) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
        fh.write("\n")


def print_issues(scraper: AlabamaPlateScraper) -> None:
    print("\nIssues summary:")
    print(f"- Missing images: {len(scraper.issues.missing_images)}")
    if scraper.issues.missing_images:
        print(f"  Example: {scraper.issues.missing_images[:10]}")

    print(f"- Slug collisions: {len(scraper.issues.slug_collisions)}")
    if scraper.issues.slug_collisions:
        print(f"  Example: {scraper.issues.slug_collisions[:10]}")

    print(f"- Category ambiguities: {len(scraper.issues.category_ambiguities)}")
    if scraper.issues.category_ambiguities:
        print(f"  Example: {scraper.issues.category_ambiguities[:10]}")

    print(f"- Stub entries: {len(scraper.issues.stub_entries)}")
    if scraper.issues.stub_entries:
        print(f"  Example: {scraper.issues.stub_entries[:10]}")


def main() -> int:
    scraper = AlabamaPlateScraper()
    try:
        payload = scraper.run()
        write_json_file(payload, OUTPUT_FILE)
        print(f"\nWrote {len(payload['plates'])} plates to {OUTPUT_FILE}")
        print_issues(scraper)
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
