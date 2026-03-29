import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(repoRoot, "public");
const platesDir = join(publicDir, "plates");
const badgesDir = join(publicDir, "badges");
const iconSvgPath = join(publicDir, "app-icon.svg");
const plateAssetsJsonPath = join(publicDir, "plate-assets.json");
const badgeAssetsJsonPath = join(publicDir, "badge-assets.json");

const plateAssets = readdirSync(platesDir)
  .filter((fileName) => /\.(png|jpg)$/i.test(fileName))
  .sort((left, right) => left.localeCompare(right))
  .map((fileName) => `plates/${fileName}`);

const badgeAssets = readdirSync(badgesDir)
  .filter((fileName) => /\.(png|jpg)$/i.test(fileName))
  .sort((left, right) => left.localeCompare(right))
  .map((fileName) => `badges/${fileName}`);

writeFileSync(plateAssetsJsonPath, `${JSON.stringify(plateAssets, null, 2)}\n`);
writeFileSync(badgeAssetsJsonPath, `${JSON.stringify(badgeAssets, null, 2)}\n`);

const svgSource = readFileSync(iconSvgPath, "utf8");
const iconTargets = [
  { fileName: "apple-touch-icon.png", size: 180 },
  { fileName: "pwa-192.png", size: 192 },
  { fileName: "pwa-512.png", size: 512 }
];

try {
  for (const target of iconTargets) {
    const outputPath = join(publicDir, target.fileName);
    execFileSync(
      "magick",
      [
        "svg:-",
        "-background",
        "none",
        "-resize",
        `${target.size}x${target.size}`,
        outputPath
      ],
      {
        input: svgSource,
        stdio: ["pipe", "ignore", "ignore"]
      }
    );
  }
} catch (error) {
  console.warn("PWA icon generation skipped:", error instanceof Error ? error.message : error);
}

mkdirSync(join(repoRoot, "analysis", "pwa"), { recursive: true });
writeFileSync(
  join(repoRoot, "analysis", "pwa", "asset-summary.txt"),
  [
    `Generated ${plateAssets.length} plate asset paths`,
    `Generated ${badgeAssets.length} badge asset paths`,
    ...iconTargets.map((target) => relative(repoRoot, join(publicDir, target.fileName)))
  ].join("\n") + "\n"
);
