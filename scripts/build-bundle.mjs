#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  buildBundleManifest,
  buildHostTargets,
  buildRegistryEntry,
  buildShareManifest,
  parseArgs,
  readPreset,
  renderMemoryBlock,
  validatePreset,
} from "./lib.mjs";

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function main() {
  const flags = parseArgs(process.argv);
  const outRoot = path.resolve(String(flags.out || "dist"));
  const preset = validatePreset(readPreset(flags.preset));
  const bundleDir = path.join(outRoot, preset.bundle_id);

  writeJson(path.join(bundleDir, "bundle.json"), buildBundleManifest(preset));
  writeJson(path.join(bundleDir, "share.json"), buildShareManifest(preset));
  writeJson(path.join(bundleDir, "registry-entry.json"), buildRegistryEntry(preset));

  for (const target of buildHostTargets()) {
    const outputPath = path.join(bundleDir, target.snippet_path);
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, renderMemoryBlock(preset, target.host));
  }

  process.stdout.write(JSON.stringify({
    bundle_id: preset.bundle_id,
    output_dir: bundleDir,
    files: [
      "bundle.json",
      "share.json",
      "registry-entry.json",
      ...buildHostTargets().map((target) => target.snippet_path),
    ],
  }, null, 2) + "\n");
}

main();
