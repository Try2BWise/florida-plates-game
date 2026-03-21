import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJsonPath = join(repoRoot, "package.json");
const outputDir = join(repoRoot, "src", "generated");
const outputPath = join(outputDir, "buildInfo.ts");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version ?? "0.0.0";
const builtAtIso = new Date().toISOString();

mkdirSync(outputDir, { recursive: true });
writeFileSync(
  outputPath,
  [
    `export const buildInfo = {`,
    `  version: ${JSON.stringify(version)},`,
    `  builtAtIso: ${JSON.stringify(builtAtIso)}`,
    `} as const;`,
    ""
  ].join("\n")
);
