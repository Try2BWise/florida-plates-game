import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJsonPath = join(repoRoot, "package.json");
const outputDir = join(repoRoot, "src", "generated");
const outputPath = join(outputDir, "buildInfo.ts");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version ?? "0.0.0";
const builtAtIso = new Date().toISOString();

function readGitValue(command) {
  try {
    return execSync(command, {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString("utf8")
      .trim();
  } catch {
    return null;
  }
}

const branch = readGitValue("git branch --show-current");
const commit = readGitValue("git rev-parse --short HEAD");

mkdirSync(outputDir, { recursive: true });
writeFileSync(
  outputPath,
  [
    `export const buildInfo = {`,
    `  version: ${JSON.stringify(version)},`,
    `  builtAtIso: ${JSON.stringify(builtAtIso)},`,
    `  branch: ${JSON.stringify(branch)},`,
    `  commit: ${JSON.stringify(commit)}`,
    `} as const;`,
    ""
  ].join("\n")
);
