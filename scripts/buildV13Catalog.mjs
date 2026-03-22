import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  APP_CATEGORIES,
  CATEGORY_OVERRIDES,
  CHARITY_CATEGORY_RULES,
  CONFIRMED_CURRENT_ONLY_PLATES,
  CURRENT_NAME_CANONICAL_OVERRIDES,
  LEGACY_CATEGORY_MAP,
  LEGACY_NAME_CANONICAL_OVERRIDES,
  LEGACY_TO_CURRENT_NAME_OVERRIDES,
  MANUAL_EXTRA_VERSIONS,
  SUPPRESSED_LEGACY_DUPLICATE_PLATES,
  SUPPRESSED_ZIP_SOURCE_TITLES,
  ZIP_VERSION_GROUP_OVERRIDES,
  ZIP_CATEGORY_MAP
} from "./v13CatalogConfig.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const currentPlatesPath = join(repoRoot, "src", "data", "floridaPlates.json");
const generatedDataDir = join(repoRoot, "src", "data", "generated");
const generatedCatalogPath = join(generatedDataDir, "catalog.generated.json");
const generatedLegacyMapPath = join(generatedDataDir, "legacy-id-map.generated.json");
const publicPlatesDir = join(repoRoot, "public", "plates");
const publicCurrentPlatesDir = join(repoRoot, "public", "zip-plates");
const outputDir = join(repoRoot, "analysis", "v1.3");
const extractedSourceDir = join(outputDir, "source_zip", "florida_specialty_plates");
const jsonOutputPath = join(outputDir, "catalog-review.json");
const markdownOutputPath = join(outputDir, "catalog-review.md");

const zipPath = process.argv[2] ?? "C:\\Users\\bwise\\Documents\\scrape-florida-plates\\florida_specialty_plates.zip";
const charityPath =
  process.argv[3] ?? "C:\\Users\\bwise\\Downloads\\florida_specialty_plates_charity_dataset.json";

function normalizeName(value) {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/\bflorida\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeName(value).replace(/\s+/g, "-");
}

function normalizeUrlHost(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.replace(/^www\./i, "");
    return parsed.toString();
  } catch {
    return url;
  }
}

function titleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dedupeVersions(versions) {
  const seen = new Set();
  const deduped = [];

  for (const version of versions) {
    const normalizedVersion = {
      ...version,
      notes: cleanPlateNotes(version.notes ?? null)
    };

    const key = [
      normalizedVersion.source,
      normalizedVersion.imagePath ?? "",
      normalizedVersion.imageKey ?? "",
      normalizedVersion.label ?? ""
    ].join("|");
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(normalizedVersion);
  }

  return deduped;
}

function getManualExtraVersions(canonicalName) {
  return (MANUAL_EXTRA_VERSIONS[canonicalName] ?? []).map((version) => ({ ...version }));
}

function pickPreferredValue(...values) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string" && value.trim().length === 0) {
      continue;
    }

    return value;
  }

  return null;
}

function combineMatchSource(left, right) {
  if (left === right) {
    return left;
  }

  const values = new Set([left, right]);
  if (values.has("manual_override")) {
    return "manual_override";
  }

  if (values.has("normalized_name")) {
    return "normalized_name";
  }

  if (values.has("legacy_only") && values.has("current_only")) {
    return "manual_override";
  }

  return left ?? right ?? "legacy_only";
}

function mergeLogicalPlateDuplicates(logicalPlates) {
  const byName = new Map();

  for (const plate of logicalPlates) {
    const key = plate.name;
    if (!byName.has(key)) {
      byName.set(key, {
        ...plate,
        sourceCategories: [...plate.sourceCategories],
        aliases: [...plate.aliases],
        versions: [...plate.versions],
        suggestedLegacyMatches: [...(plate.suggestedLegacyMatches ?? [])]
      });
      continue;
    }

    const existing = byName.get(key);
    existing.sourceCategories = [...new Set([...existing.sourceCategories, ...plate.sourceCategories])];
    existing.aliases = [...new Set([...existing.aliases, ...plate.aliases].filter((alias) => alias !== existing.name))];
    existing.versions = dedupeVersions([...existing.versions, ...plate.versions]);
    existing.suggestedLegacyMatches = existing.suggestedLegacyMatches.length
      ? existing.suggestedLegacyMatches
      : [...(plate.suggestedLegacyMatches ?? [])];
    existing.matchSource = combineMatchSource(existing.matchSource, plate.matchSource);
    existing.introducedYear = pickPreferredValue(existing.introducedYear, plate.introducedYear);
    existing.introducedYearConfidence = pickPreferredValue(
      existing.introducedYearConfidence,
      plate.introducedYearConfidence
    );
    existing.popularityWeight = pickPreferredValue(existing.popularityWeight, plate.popularityWeight);
    existing.sponsor = {
      name: pickPreferredValue(existing.sponsor?.name, plate.sponsor?.name),
      notes: pickPreferredValue(existing.sponsor?.notes, plate.sponsor?.notes),
      url: pickPreferredValue(existing.sponsor?.url, plate.sponsor?.url)
    };
  }

  return [...byName.values()];
}

function inferLegacyImagePath(imageKey) {
  const candidates = [".png", ".jpg", ".jpeg"].map((extension) => `${imageKey}${extension}`);
  const match = candidates.find((name) => existsSync(join(publicPlatesDir, name)));
  return match ? `plates/${match}` : null;
}

function loadCurrentRecords() {
  const raw = JSON.parse(readFileSync(currentPlatesPath, "utf8"));
  const categories = ["Environmental", "Miscellaneous", "Professional Sports", "Universities"];
  const records = [];

  for (const sourceCategory of categories) {
    for (const entry of raw[sourceCategory]) {
      records.push({
        legacyId: `${sourceCategory}-${entry.id}`,
        name: entry.plate.LicensePlate,
        sourceCategory,
        imageKey: entry.plate.Image,
        imagePath: inferLegacyImagePath(entry.plate.Image),
        enactedOn: entry.plate.DateEnacted ?? null,
        sourceUrl: entry.plate.Url ?? null
      });
    }
  }

  return records;
}

function dedupeZipRecords(records) {
  const deduped = [];
  const seen = new Set();

  for (const record of records) {
    const key = [normalizeName(record.LicensePlate), record.ImageFile ?? ""].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(record);
  }

  return deduped;
}

function loadZipRecords() {
  const extractedJsonPath = join(extractedSourceDir, "plates_raw.json");
  if (!existsSync(extractedJsonPath)) {
    throw new Error(
      `Missing extracted ZIP source at ${extractedJsonPath}. Extract ${zipPath} into ${extractedSourceDir} first.`
    );
  }

  const rawJson = readFileSync(extractedJsonPath, "utf8");
  const parsed = JSON.parse(rawJson);

  const sourceImagesDir = join(extractedSourceDir, "images");

  return dedupeZipRecords(parsed.plates).filter((record) => {
    if (record.LicensePlate === "404 Error, content does not exist anymore") {
      return false;
    }

    if (record.LicensePlate === "Specialty") {
      return false;
    }

    if (record.LicensePlate === "Personalized Florida License Plates") {
      return false;
    }

    if (record.LicensePlate === "Florida Don't Tread On Me Gadsden Flag") {
      return false;
    }

    if (SUPPRESSED_ZIP_SOURCE_TITLES.has(record.LicensePlate)) {
      return false;
    }

    if (!record.ImageFile) {
      return false;
    }

    const sourcePath = join(sourceImagesDir, record.ImageFile.replace(/^images[\\/]/, ""));
    return existsSync(sourcePath);
  });
}

function loadCharityRecords() {
  return JSON.parse(readFileSync(charityPath, "utf8"));
}

function buildCharityIndex(records) {
  const byNormalized = new Map();

  for (const record of records) {
    const key = normalizeName(record.plate_name);
    if (!byNormalized.has(key)) {
      byNormalized.set(key, record);
    }
  }

  return byNormalized;
}

function parsePopularityWeight(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
}

function parseYearConfidence(value) {
  if (!value) {
    return null;
  }

  const lowered = String(value).trim().toLowerCase();
  return ["high", "medium", "low"].includes(lowered) ? lowered : null;
}

function resolveSponsorName(charityRecord) {
  const rawName = charityRecord?.beneficiary_or_primary_beneficiary
    ? String(charityRecord.beneficiary_or_primary_beneficiary).trim()
    : null;

  if (!rawName) {
    return null;
  }

  const cleanedName = rawName
    .replace(/\s*\/\s*designated.*$/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleanedName || null;
}

function cleanPlateNotes(value) {
  if (!value) {
    return null;
  }

  const cleaned = String(value)
    .trim()
    .replace(
      /^NOTE:\s*ALL FLORIDA RESIDENTS OF ALL FLORIDA COUNTIES CAN ORDER THIS PLATE\.\s*/i,
      ""
    )
    .replace(/\s*Are you a .*? alumni\?\s*Support your school and switch to this Specialty License Plate today!?/gi, "")
    .replace(/\s*ORDER TODAY!?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || null;
}

function resolveSponsorNotes(charityRecord, zipRecord) {
  const charityNotes = charityRecord?.notes ? String(charityRecord.notes).trim() : null;
  if (
    charityNotes &&
    !/^best-effort normalization\b.*$/i.test(charityNotes) &&
    !/^Florida collegiate plate; statute .* alumni beneficiary\.?$/i.test(charityNotes)
  ) {
    const cleanedCharityNotes = charityNotes
      .replace(/\b;?\s*brochure lists active plate\.?/gi, "")
      .replace(/\s*Are you a .*? alumni\?\s*Support your school and switch to this Specialty License Plate today!?/gi, "")
      .replace(/\s*ORDER TODAY!?/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    return cleanedCharityNotes || null;
  }

  return cleanPlateNotes(zipRecord?.Notes ?? null);
}

function resolveCharityRecord(name, charityIndex) {
  const canonical = CURRENT_NAME_CANONICAL_OVERRIDES[name] ?? name;
  return charityIndex.get(normalizeName(canonical)) ?? charityIndex.get(normalizeName(name)) ?? null;
}

function resolveAppCategory({ canonicalName, legacyCategory, zipCategories, charityRecord }) {
  if (CATEGORY_OVERRIDES[canonicalName]) {
    return CATEGORY_OVERRIDES[canonicalName];
  }

  if (legacyCategory && LEGACY_CATEGORY_MAP[legacyCategory]) {
    return LEGACY_CATEGORY_MAP[legacyCategory];
  }

  for (const category of zipCategories ?? []) {
    if (ZIP_CATEGORY_MAP[category]) {
      return ZIP_CATEGORY_MAP[category];
    }
  }

  if (charityRecord?.category) {
    const match = CHARITY_CATEGORY_RULES.find((rule) => rule.match.test(charityRecord.category));
    if (match) {
      return match.appCategory;
    }
  }

  return "Civic & Causes";
}

function chooseCanonicalName(legacyRecord, zipRecord) {
  if (legacyRecord) {
    return LEGACY_NAME_CANONICAL_OVERRIDES[legacyRecord.name] ?? legacyRecord.name;
  }

  if (zipRecord) {
    return CURRENT_NAME_CANONICAL_OVERRIDES[zipRecord.LicensePlate] ?? zipRecord.LicensePlate;
  }

  return "Unknown Plate";
}

function buildLegacyMatchIndex(zipRecords) {
  const byNormalized = new Map();

  for (const record of zipRecords) {
    const normalized = normalizeName(record.LicensePlate);
    if (!byNormalized.has(normalized)) {
      byNormalized.set(normalized, record);
    }
  }

  return byNormalized;
}

function getZipGrouping(record) {
  const override = ZIP_VERSION_GROUP_OVERRIDES[record.LicensePlate];
  if (override) {
    return override;
  }

  const canonicalName = CURRENT_NAME_CANONICAL_OVERRIDES[record.LicensePlate] ?? record.LicensePlate;
  return {
    canonicalName,
    label: "Current",
    isDefault: true
  };
}

function buildZipGroups(zipRecords) {
  const groups = new Map();

  for (const record of zipRecords) {
    if (SUPPRESSED_ZIP_SOURCE_TITLES.has(record.LicensePlate)) {
      continue;
    }

    const grouping = getZipGrouping(record);
    const key = normalizeName(grouping.canonicalName);
    if (!groups.has(key)) {
      groups.set(key, {
        canonicalName: grouping.canonicalName,
        records: []
      });
    }

    groups.get(key).records.push({
      record,
      label: grouping.label ?? "Current",
      isDefault: grouping.isDefault ?? true
    });
  }

  return groups;
}

function tokenize(value) {
  return new Set(
    normalizeName(value)
      .split(" ")
      .filter((token) => token.length >= 3)
  );
}

function scoreSimilarity(left, right) {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let shared = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      shared += 1;
    }
  }

  return shared / Math.max(leftTokens.size, rightTokens.size);
}

function suggestCandidates(name, candidates, limit = 3) {
  if (CONFIRMED_CURRENT_ONLY_PLATES.has(name)) {
    return [];
  }

  return candidates
    .map((candidate) => ({
      name: candidate,
      score: scoreSimilarity(name, candidate)
    }))
    .filter((candidate) => candidate.score >= 0.34)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

function buildLogicalCatalog({ currentRecords, zipRecords, charityRecords }) {
  const charityIndex = buildCharityIndex(charityRecords);
  const zipGroups = buildZipGroups(zipRecords);
  const zipByNormalized = new Map(zipGroups);
  const unmatchedZipGroupKeys = new Set(zipGroups.keys());
  const logicalPlates = [];

  for (const legacyRecord of currentRecords) {
    const overrideName = LEGACY_TO_CURRENT_NAME_OVERRIDES[legacyRecord.name];
    const zipGroup =
      (overrideName ? zipByNormalized.get(normalizeName(overrideName)) : null) ??
      zipByNormalized.get(normalizeName(legacyRecord.name)) ??
      null;

    if (zipGroup) {
      unmatchedZipGroupKeys.delete(normalizeName(zipGroup.canonicalName));
    }

    const defaultZipRecord = zipGroup
      ? zipGroup.records.find((entry) => entry.isDefault)?.record ?? zipGroup.records[0].record
      : null;

    const canonicalName = chooseCanonicalName(legacyRecord, defaultZipRecord);
    const charityRecord = resolveCharityRecord(canonicalName, charityIndex);
    const aliases = new Set(
      [
        legacyRecord.name,
        ...(zipGroup?.records.map((entry) => entry.record.LicensePlate) ?? [])
      ]
        .filter(Boolean)
        .filter((name) => name !== canonicalName)
    );
    const suppressLegacyVersion =
      zipGroup !== null && SUPPRESSED_LEGACY_DUPLICATE_PLATES.has(canonicalName);

    logicalPlates.push({
      id: legacyRecord.legacyId,
      name: canonicalName,
      appCategory: resolveAppCategory({
        canonicalName,
        legacyCategory: legacyRecord.sourceCategory,
        zipCategories: defaultZipRecord?.Categories ?? [],
        charityRecord
      }),
      sourceCategories: [
        ...new Set([legacyRecord.sourceCategory, ...(defaultZipRecord?.Categories ?? [])].filter(Boolean))
      ],
      aliases: [...aliases],
      introducedYear:
        charityRecord?.year_introduced && Number.isFinite(Number(charityRecord.year_introduced))
          ? Number(charityRecord.year_introduced)
          : null,
      introducedYearConfidence: parseYearConfidence(charityRecord?.year_confidence),
      popularityWeight: parsePopularityWeight(charityRecord?.popularity_weight_1_to_5),
      sponsor: {
        name: resolveSponsorName(charityRecord),
        notes: resolveSponsorNotes(charityRecord, defaultZipRecord),
        url: defaultZipRecord?.ProductUrl ?? defaultZipRecord?.Url ?? null
      },
      matchSource: zipGroup
        ? overrideName
          ? "manual_override"
          : "normalized_name"
        : "legacy_only",
      versions: dedupeVersions([
        ...(!suppressLegacyVersion
          ? [
              {
                id: `${slugify(canonicalName)}-legacy`,
                label: "Legacy",
                source: "legacy",
                isDefault: !zipGroup,
                imageKey: legacyRecord.imageKey,
                imagePath: legacyRecord.imagePath,
                productUrl: legacyRecord.sourceUrl,
                notes: null
              }
            ]
          : []),
        ...(zipGroup
          ? zipGroup.records.map(({ record, label, isDefault }) => ({
              id: `${slugify(canonicalName)}-${slugify(label)}`,
              label,
              source: "zip",
              isDefault,
              imageKey: record.Image,
              imagePath: record.ImageFile,
              imageUrl: record.ImageUrl ?? null,
              productUrl: record.ProductUrl ?? record.Url ?? null,
               notes: cleanPlateNotes(record.Notes ?? null)
              }))
          : [])
        ,
        ...getManualExtraVersions(canonicalName)
      ])
    });
  }

  const legacyNames = currentRecords.map((record) => record.name);

  for (const [groupKey, zipGroup] of zipGroups) {
    if (!unmatchedZipGroupKeys.has(groupKey)) {
      continue;
    }

    const defaultZipRecord = zipGroup.records.find((entry) => entry.isDefault)?.record ?? zipGroup.records[0].record;
    const canonicalName = chooseCanonicalName(null, defaultZipRecord);
    const charityRecord = resolveCharityRecord(canonicalName, charityIndex);

    logicalPlates.push({
      id: slugify(canonicalName),
      name: canonicalName,
      appCategory: resolveAppCategory({
        canonicalName,
        legacyCategory: null,
        zipCategories: defaultZipRecord.Categories ?? [],
        charityRecord
      }),
      sourceCategories: [...new Set((defaultZipRecord.Categories ?? []).filter(Boolean))],
      aliases: [
        ...new Set(
          zipGroup.records
            .map((entry) => entry.record.LicensePlate)
            .filter((name) => name && name !== canonicalName)
        )
      ],
      introducedYear:
        charityRecord?.year_introduced && Number.isFinite(Number(charityRecord.year_introduced))
          ? Number(charityRecord.year_introduced)
          : null,
      introducedYearConfidence: parseYearConfidence(charityRecord?.year_confidence),
      popularityWeight: parsePopularityWeight(charityRecord?.popularity_weight_1_to_5),
      sponsor: {
        name: resolveSponsorName(charityRecord),
        notes: resolveSponsorNotes(charityRecord, defaultZipRecord),
        url: defaultZipRecord.ProductUrl ?? defaultZipRecord.Url ?? null
      },
      matchSource: "current_only",
      suggestedLegacyMatches: suggestCandidates(canonicalName, legacyNames),
      versions: dedupeVersions([
        ...zipGroup.records.map(({ record, label, isDefault }) => ({
          id: `${slugify(canonicalName)}-${slugify(label)}`,
          label,
          source: "zip",
          isDefault,
          imageKey: record.Image,
          imagePath: record.ImageFile,
          imageUrl: record.ImageUrl ?? null,
          productUrl: record.ProductUrl ?? record.Url ?? null,
          notes: cleanPlateNotes(record.Notes ?? null)
        })),
        ...getManualExtraVersions(canonicalName)
      ])
    });
  }

  const mergedLogicalPlates = mergeLogicalPlateDuplicates(logicalPlates);
  mergedLogicalPlates.sort((left, right) => left.name.localeCompare(right.name));

  return mergedLogicalPlates;
}

function summarizeCatalog(logicalPlates) {
  const summary = {
    logicalPlates: logicalPlates.length,
    withMultipleVersions: logicalPlates.filter((plate) => plate.versions.length > 1).length,
    legacyOnly: logicalPlates.filter((plate) => plate.matchSource === "legacy_only").length,
    currentOnly: logicalPlates.filter((plate) => plate.matchSource === "current_only").length,
    normalizedMatches: logicalPlates.filter((plate) => plate.matchSource === "normalized_name").length,
    manualOverrideMatches: logicalPlates.filter((plate) => plate.matchSource === "manual_override").length,
    byCategory: APP_CATEGORIES.map((category) => ({
      category,
      count: logicalPlates.filter((plate) => plate.appCategory === category).length
    })).filter((entry) => entry.count > 0)
  };

  return summary;
}

function stageCurrentImages(logicalPlates) {
  const sourceImagesDir = join(extractedSourceDir, "images");
  rmSync(publicCurrentPlatesDir, { recursive: true, force: true });
  mkdirSync(publicCurrentPlatesDir, { recursive: true });

  for (const plate of logicalPlates) {
    for (const version of plate.versions) {
      if (version.source !== "zip") {
        continue;
      }

      const sourcePath = join(sourceImagesDir, version.imagePath.replace(/^images[\\/]/, ""));
      const destinationName = version.imagePath.replace(/^images[\\/]/, "");
      copyFileSync(sourcePath, join(publicCurrentPlatesDir, destinationName));
      version.imagePath = `zip-plates/${destinationName}`;
    }
  }
}

function buildLegacyIdMap(logicalPlates) {
  return Object.fromEntries(
    logicalPlates
      .filter((plate) => plate.versions.some((version) => version.source === "legacy"))
      .map((plate) => [plate.id, plate.id])
  );
}

function buildMarkdownReport({ summary, logicalPlates, zipRecords, charityRecords }) {
  const lines = [];
  lines.push("# v1.3 Catalog Review", "");
  lines.push("## Summary", "");
  lines.push(`- Logical plates in merged catalog: ${summary.logicalPlates}`);
  lines.push(`- Plates with both legacy and current versions: ${summary.withMultipleVersions}`);
  lines.push(`- Legacy-only plates: ${summary.legacyOnly}`);
  lines.push(`- Current-only plates: ${summary.currentOnly}`);
  lines.push(`- Normalized-name matches: ${summary.normalizedMatches}`);
  lines.push(`- Manual override matches: ${summary.manualOverrideMatches}`);
  lines.push(`- ZIP source rows after cleanup: ${zipRecords.length}`);
  lines.push(`- Charity metadata rows: ${charityRecords.length}`, "");
  lines.push("## App Categories", "");

  for (const entry of summary.byCategory) {
    lines.push(`- ${entry.category}: ${entry.count}`);
  }

  const multiVersionSamples = logicalPlates
    .filter((plate) => plate.versions.length > 1)
    .slice(0, 25);

  lines.push("", "## Multi-Version Samples", "");
  for (const plate of multiVersionSamples) {
    const aliasText = plate.aliases.length > 0 ? ` (aliases: ${plate.aliases.join(", ")})` : "";
    lines.push(`- ${plate.name}${aliasText}`);
  }

  const currentOnly = logicalPlates.filter((plate) => plate.matchSource === "current_only").slice(0, 30);
  lines.push("", "## Current-Only Samples", "");
  for (const plate of currentOnly) {
    const suggestionText =
      plate.suggestedLegacyMatches?.length > 0
        ? ` -> possible legacy matches: ${plate.suggestedLegacyMatches
            .map((candidate) => `${candidate.name} (${candidate.score.toFixed(2)})`)
            .join(", ")}`
        : "";
    lines.push(`- ${plate.name}${suggestionText}`);
  }

  const legacyOnly = logicalPlates.filter((plate) => plate.matchSource === "legacy_only").slice(0, 30);
  lines.push("", "## Legacy-Only Samples", "");
  for (const plate of legacyOnly) {
    lines.push(`- ${plate.name}`);
  }

  lines.push("", "## Notes", "");
  lines.push("- Current in-app plates are treated as legacy versions.");
  lines.push("- ZIP plates are treated as current versions.");
  lines.push("- ZIP duplicates caused only by URL host differences were collapsed.");
  lines.push("- The charity file is used as enrichment only because category and confidence data need normalization.");

  return `${lines.join("\n")}\n`;
}

function main() {
  const currentRecords = loadCurrentRecords();
  const zipRecords = loadZipRecords();
  const charityRecords = loadCharityRecords();
  const logicalPlates = buildLogicalCatalog({ currentRecords, zipRecords, charityRecords });
  stageCurrentImages(logicalPlates);
  const summary = summarizeCatalog(logicalPlates);
  const legacyIdMap = buildLegacyIdMap(logicalPlates);
  const report = {
    generatedAtIso: new Date().toISOString(),
    zipPath,
    charityPath,
    summary,
    logicalPlates
  };

  mkdirSync(outputDir, { recursive: true });
  mkdirSync(generatedDataDir, { recursive: true });
  writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(
    markdownOutputPath,
    buildMarkdownReport({ summary, logicalPlates, zipRecords, charityRecords })
  );
  writeFileSync(generatedCatalogPath, `${JSON.stringify(logicalPlates, null, 2)}\n`);
  writeFileSync(generatedLegacyMapPath, `${JSON.stringify(legacyIdMap, null, 2)}\n`);

  console.log(`Wrote ${jsonOutputPath}`);
  console.log(`Wrote ${markdownOutputPath}`);
  console.log(`Wrote ${generatedCatalogPath}`);
  console.log(`Wrote ${generatedLegacyMapPath}`);
  console.log(
    [
      `logical=${summary.logicalPlates}`,
      `multiVersion=${summary.withMultipleVersions}`,
      `legacyOnly=${summary.legacyOnly}`,
      `currentOnly=${summary.currentOnly}`,
      `normalized=${summary.normalizedMatches}`,
      `manual=${summary.manualOverrideMatches}`
    ].join(" ")
  );
}

main();
