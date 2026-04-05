import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const states = process.argv.slice(2);
const statesToBuild = states.length > 0 ? states : ["florida"];
const generatedDir = join(repoRoot, "src", "data", "generated");

function loadMasterDataset(state) {
  const masterPath = join(repoRoot, "src", "data", `${state}-plate-master.json`);
  return JSON.parse(readFileSync(masterPath, "utf8"));
}

function normalizeSearchTerms(...termLists) {
  const normalized = new Set();

  for (const termList of termLists) {
    if (!Array.isArray(termList)) {
      continue;
    }

    for (const term of termList) {
      if (typeof term !== "string") {
        continue;
      }

      const cleaned = term.trim().toLowerCase();
      if (cleaned) {
        normalized.add(cleaned);
      }
    }
  }

  return Array.from(normalized);
}

function ensureMotorcycleSuffix(value, category) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed || category !== "Motorcycle Plates" || /\(motorcycle\)$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed} (Motorcycle)`;
}

function buildRuntimePlate(plate) {
  const name = ensureMotorcycleSuffix(plate.name, plate.category);
  const displayName = ensureMotorcycleSuffix(plate.displayName, plate.category);

  return {
    id: plate.id,
    slug: plate.slug,
    name,
    displayName,
    baseName: plate.baseName,
    variantLabel: plate.variantLabel ?? null,
    plateType: plate.plateType,
    isCurrent: Boolean(plate.isCurrent),
    isActive: Boolean(plate.isActive),
    category: plate.category,
    image: {
      path: plate.image?.path ?? "",
      remoteUrl: plate.image?.remoteUrl ?? null
    },
    sponsor: plate.sponsor ?? null,
    notes: plate.notes ?? null,
    searchTerms: normalizeSearchTerms(plate.searchTerms, plate.tags),
    variantOf: plate.variantOf ?? null,
    relatedPlates: Array.isArray(plate.relatedPlates) ? plate.relatedPlates : []
  };
}

function buildRuntimeDataset(master) {
  return {
    schemaVersion: master.schemaVersion ?? 1,
    generatedDate: new Date().toISOString().slice(0, 10),
    generatedFrom: `src/data/${master.state?.toLowerCase() ?? "unknown"}-plate-master.json`,
    plateCount: Array.isArray(master.plates) ? master.plates.length : 0,
    plates: Array.isArray(master.plates) ? master.plates.map(buildRuntimePlate) : []
  };
}

function buildLegacyIdMap(master) {
  const legacyIdMap = {};

  if (!Array.isArray(master.plates)) {
    return legacyIdMap;
  }

  for (const plate of master.plates) {
    if (!Array.isArray(plate.sourceRefs)) {
      continue;
    }

    for (const sourceRef of plate.sourceRefs) {
      if (
        sourceRef?.source === "catalog.generated.json" &&
        typeof sourceRef.sourceId === "string" &&
        sourceRef.sourceId.length > 0
      ) {
        legacyIdMap[sourceRef.sourceId] = plate.id;
      }
    }
  }

  return legacyIdMap;
}

mkdirSync(generatedDir, { recursive: true });

for (const state of statesToBuild) {
  const masterDataset = loadMasterDataset(state);
  const runtimeDataset = buildRuntimeDataset(masterDataset);
  const legacyIdMap = buildLegacyIdMap(masterDataset);

  const runtimePath = join(generatedDir, `${state}-plate-driver.generated.json`);
  const legacyMapPath = join(generatedDir, `${state}-legacy-id-map.generated.json`);

  writeFileSync(runtimePath, `${JSON.stringify(runtimeDataset, null, 2)}\n`, "utf8");
  writeFileSync(legacyMapPath, `${JSON.stringify(legacyIdMap, null, 2)}\n`, "utf8");

  console.log(`Wrote ${runtimePath} (${runtimeDataset.plateCount} plates)`);
  console.log(`Wrote ${legacyMapPath}`);
}
