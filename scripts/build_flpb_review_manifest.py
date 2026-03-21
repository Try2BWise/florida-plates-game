from __future__ import annotations

import json
import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path


PAGE_MAP = {
    "Universities": [1, 2, 3, 4],
    "Environmental": [5, 6, 7],
    "Professional Sports": [9],
    "Miscellaneous": [8, 10, 11, 12, 13],
}

CANONICAL_ALIASES = {
    "floridaamuniversity": "floridaaandmuniversity",
    "floridaaandmuniversity": "floridaaandmuniversity",
    "bethunecookmanuniv": "bethunecookmanuniversity",
    "bethunecookmanuniversity": "bethunecookmanuniversity",
    "largemouthbass": "largemouthbass",
    "largemouthbass": "largemouthbass",
    "largemouthbass\\": "largemouthbass",
    "challengercolumbia": "challengercolumbia",
    "challengercolumbia": "challengercolumbia",
    "floridasheriffsassociation": "floridasheriffsassociation",
    "floridasheriffsassociation": "floridasheriffsassociation",
    "edwardwaterscollege": "edwardwatersuniversity",
    "edwardwatersuniversity": "edwardwatersuniversity",
    "embryriddleaeronauticaluniversity": "embryriddleaeronauticaluniversity",
    "embryriddleaeronauticaluniv": "embryriddleaeronauticaluniversity",
    "jacksonvillejaguarsfootball": "jacksonvillejaguars",
    "jacksonvillejaguar": "jacksonvillejaguars",
    "miamidolphinsfootball": "miamidolphins",
    "miamiheatbasketball": "miamiheat",
    "miamimarlinsbaseball": "miamimarlins",
    "orlandomagicbasketball": "orlandomagic",
    "tampabaybuccaneersfootball": "tampabaybuccaneers",
    "tampabaybuccaneernfl": "tampabaybuccaneers",
    "tampabayraysbaseball": "tampabayrays",
    "tampabaylightninghockey": "tampabaylightning",
    "stjohnsriver": "stjohnsriver",
    "saveourseas": "saveourseas",
    "supportourtroops": "supportourtroops",
    "americanredcross": "americanredcross",
    "usairforce": "usairforce",
    "usarmy": "usarmy",
    "uscoastguard": "uscoastguard",
}

BROCHURE_TITLES = {
    "specialtycollegiatecont",
    "specialtycollegiate",
    "specialtyenvironmentalwildlifecont",
    "specialtyenvironmentalwildlife",
    "specialtysports",
    "specialtyspecialinterest",
    "specialtyspecialinterestcont",
    "sunshinestate",
    "countyname",
    "ingodwetrust",
    "specialty",
    "cont",
    "noteall",
}

GENERIC_SNIPPETS = {
    "florida",
    "sample",
    "university",
    "college",
    "cont",
    "specialty",
    "sports",
    "miscellaneous",
    "environmental",
    "wildlife",
    "sampl",
    "andard",
    "countyname",
    "ingodwetrust",
    "ersity",
}


@dataclass
class Candidate:
    page: int
    snippet: str
    score: float


def normalize(text: str) -> str:
    lowered = text.lower().replace("&", "and")
    lowered = lowered.replace("'", "")
    lowered = lowered.replace("univ.", "university")
    lowered = lowered.replace("univ", "university")
    lowered = lowered.replace("col.", "college")
    lowered = lowered.replace("\\", "")
    lowered = lowered.replace("/", "")
    return re.sub(r"[^a-z0-9]+", "", lowered)


def canonicalize(text: str) -> str:
    return CANONICAL_ALIASES.get(normalize(text), normalize(text))


def load_catalog(catalog_path: Path) -> list[dict[str, str]]:
    raw = json.loads(catalog_path.read_text(encoding="utf-8"))
    plates: list[dict[str, str]] = []
    for category, entries in raw.items():
        if not isinstance(entries, list):
            continue
        for entry in entries:
            plate = entry["plate"]
            plates.append(
                {
                    "category": category,
                    "id": f"{category}-{entry['id']}",
                    "name": plate["LicensePlate"],
                    "image_key": plate["Image"],
                }
            )
    return plates


def build_image_lookup(image_manifest_path: Path) -> dict[int, dict[str, object]]:
    manifest = json.loads(image_manifest_path.read_text(encoding="utf-8"))
    return {item["object"]: item for item in manifest}


def is_meaningful_snippet(snippet: str) -> bool:
    canonical = canonicalize(snippet)
    if len(canonical) < 6:
        return False
    if canonical in BROCHURE_TITLES:
        return False
    if canonical in GENERIC_SNIPPETS:
        return False
    if canonical.startswith("noteall"):
        return False
    return bool(re.search(r"[A-Za-z]{3,}", snippet))


def score_candidate(plate_name: str, snippet: str) -> float:
    plate_canonical = canonicalize(plate_name)
    snippet_canonical = canonicalize(snippet)
    if snippet_canonical == plate_canonical:
        return 1.0
    if len(snippet_canonical) >= max(8, len(plate_canonical) // 2) and (
        plate_canonical in snippet_canonical or snippet_canonical in plate_canonical
    ):
        return 0.92
    return SequenceMatcher(None, plate_canonical, snippet_canonical).ratio()


def find_candidates_for_pages(
    plate: dict[str, str], pages: list[dict[str, object]], allowed_pages: set[int]
) -> list[Candidate]:
    plate_canonical = canonicalize(plate["name"])
    candidates: list[Candidate] = []
    for page in pages:
        if page["page"] not in allowed_pages:
            continue
        for snippet in page["text_snippets"]:
            if not isinstance(snippet, str) or not is_meaningful_snippet(snippet):
                continue
            score = score_candidate(plate["name"], snippet)
            if score >= 0.72:
                candidates.append(Candidate(page=page["page"], snippet=snippet, score=score))
    candidates.sort(key=lambda candidate: (-candidate.score, candidate.page, candidate.snippet))
    return candidates


def find_candidates(plate: dict[str, str], pages: list[dict[str, object]]) -> list[Candidate]:
    preferred_pages = set(PAGE_MAP[plate["category"]])
    candidates = find_candidates_for_pages(plate, pages, preferred_pages)
    if candidates:
        return candidates
    return find_candidates_for_pages(
        plate,
        [page for page in pages if page["page"] <= 13],
        set(range(1, 14)),
    )


def dedupe_candidates(candidates: list[Candidate]) -> list[Candidate]:
    seen: set[tuple[int, str]] = set()
    deduped: list[Candidate] = []
    for candidate in candidates:
        key = (candidate.page, candidate.snippet)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(candidate)
    return deduped


def classify_confidence(candidates: list[Candidate]) -> str:
    if not candidates:
        return "not_found"
    best = candidates[0]
    if best.score >= 0.97:
        return "high_confidence"
    if best.score >= 0.86:
        return "medium_confidence"
    return "needs_review"


def build_manifest(
    catalog: list[dict[str, str]],
    pages: list[dict[str, object]],
    image_lookup: dict[int, dict[str, object]],
) -> dict[str, object]:
    manifest_entries = []
    matched_canonical_names: set[str] = set()

    for plate in catalog:
        candidates = dedupe_candidates(find_candidates(plate, pages))
        if candidates:
            matched_canonical_names.add(canonicalize(plate["name"]))

        candidate_pages = []
        for page in pages:
            if page["page"] not in PAGE_MAP[plate["category"]]:
                continue
            if any(candidate.page == page["page"] for candidate in candidates[:3]):
                candidate_pages.append(
                    {
                        "page": page["page"],
                        "candidate_image_objects": page["image_objects"],
                        "candidate_images": [
                            image_lookup[obj]["png_path"] or image_lookup[obj]["raw_path"]
                            for obj in page["image_objects"]
                            if obj in image_lookup
                        ],
                    }
                )

        manifest_entries.append(
            {
                "plate_id": plate["id"],
                "plate_name": plate["name"],
                "category": plate["category"],
                "image_key": plate["image_key"],
                "confidence": classify_confidence(candidates),
                "best_match": (
                    {
                        "page": candidates[0].page,
                        "snippet": candidates[0].snippet,
                        "score": round(candidates[0].score, 3),
                    }
                    if candidates
                    else None
                ),
                "candidate_matches": [
                    {
                        "page": candidate.page,
                        "snippet": candidate.snippet,
                        "score": round(candidate.score, 3),
                    }
                    for candidate in candidates[:5]
                ],
                "candidate_pages": candidate_pages,
            }
        )

    brochure_only_candidates = []
    for page in pages:
        if page["page"] > 13:
            continue
        for snippet in page["text_snippets"]:
            if not isinstance(snippet, str) or not is_meaningful_snippet(snippet):
                continue
            snippet_canonical = canonicalize(snippet)
            if snippet_canonical in matched_canonical_names:
                continue
            brochure_only_candidates.append(
                {
                    "page": page["page"],
                    "snippet": snippet,
                    "canonical": snippet_canonical,
                }
            )

    unique_brochure_only = []
    seen_brochure_only: set[str] = set()
    for item in brochure_only_candidates:
        if item["canonical"] in seen_brochure_only:
            continue
        seen_brochure_only.add(item["canonical"])
        unique_brochure_only.append(item)

    confidence_summary: dict[str, int] = {}
    for entry in manifest_entries:
        confidence_summary[entry["confidence"]] = confidence_summary.get(entry["confidence"], 0) + 1

    return {
        "summary": {
            "total_current_plates": len(manifest_entries),
            "confidence_counts": confidence_summary,
            "brochure_only_candidate_count": len(unique_brochure_only),
        },
        "entries": manifest_entries,
        "brochure_only_candidates": unique_brochure_only,
    }


def write_markdown(markdown_path: Path, manifest: dict[str, object]) -> None:
    entries = manifest["entries"]
    summary = manifest["summary"]
    brochure_only_candidates = manifest["brochure_only_candidates"]

    high = [entry for entry in entries if entry["confidence"] == "high_confidence"]
    medium = [entry for entry in entries if entry["confidence"] == "medium_confidence"]
    review = [entry for entry in entries if entry["confidence"] == "needs_review"]
    missing = [entry for entry in entries if entry["confidence"] == "not_found"]

    lines = [
        "# FLPB Review Manifest",
        "",
        f"- Current game plates reviewed: {summary['total_current_plates']}",
        f"- High confidence brochure matches: {len(high)}",
        f"- Medium confidence brochure matches: {len(medium)}",
        f"- Needs review: {len(review)}",
        f"- Not found in brochure text: {len(missing)}",
        f"- Brochure-only candidate snippets: {summary['brochure_only_candidate_count']}",
        "",
        "## High Confidence",
        "",
    ]

    for entry in high[:40]:
        best = entry["best_match"]
        lines.append(
            f"- {entry['plate_name']} [{entry['category']}] -> page {best['page']} via \"{best['snippet']}\" ({best['score']})"
        )

    if len(high) > 40:
        lines.append(f"- ... and {len(high) - 40} more")

    lines.extend(["", "## Needs Review", ""])
    for entry in (medium + review)[:40]:
        best = entry["best_match"]
        if best:
            lines.append(
                f"- {entry['plate_name']} [{entry['category']}] -> best page {best['page']} via \"{best['snippet']}\" ({best['score']})"
            )
        else:
            lines.append(f"- {entry['plate_name']} [{entry['category']}] -> no best match")

    if len(medium) + len(review) > 40:
        lines.append(f"- ... and {len(medium) + len(review) - 40} more")

    lines.extend(["", "## Not Found", ""])
    for entry in missing[:40]:
        lines.append(f"- {entry['plate_name']} [{entry['category']}]")

    if len(missing) > 40:
        lines.append(f"- ... and {len(missing) - 40} more")

    lines.extend(["", "## Brochure-only Candidate Snippets", ""])
    for item in brochure_only_candidates[:50]:
        lines.append(f"- Page {item['page']}: {item['snippet']}")

    if len(brochure_only_candidates) > 50:
        lines.append(f"- ... and {len(brochure_only_candidates) - 50} more")

    markdown_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    analysis_root = repo_root / "analysis" / "flpb"
    pages_path = analysis_root / "pages.json"
    image_manifest_path = analysis_root / "image-manifest.json"
    catalog_path = repo_root / "src" / "data" / "floridaPlates.json"
    review_json_path = analysis_root / "review-manifest.json"
    review_md_path = analysis_root / "review-manifest.md"

    pages = json.loads(pages_path.read_text(encoding="utf-8"))
    image_lookup = build_image_lookup(image_manifest_path)
    catalog = load_catalog(catalog_path)
    manifest = build_manifest(catalog, pages, image_lookup)

    review_json_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    write_markdown(review_md_path, manifest)

    print(f"Wrote {review_json_path}")
    print(f"Wrote {review_md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
