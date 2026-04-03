#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  parseArgs,
  readPreset,
  renderMemoryBlock,
  targetFileFor,
  upsertManagedBlock,
  validatePreset,
} from "./lib.mjs";

function main() {
  const flags = parseArgs(process.argv);
  const host = String(flags.host || "");
  const scope = String(flags.scope || "auto");
  const cwd = path.resolve(String(flags.cwd || process.cwd()));
  const preset = validatePreset(readPreset(flags.preset));
  const targetFile = targetFileFor(host, scope, cwd);
  const block = renderMemoryBlock(preset, host);
  const existing = existsSync(targetFile) ? readFileSync(targetFile, "utf8") : "";
  const updated = upsertManagedBlock(existing, block);

  mkdirSync(path.dirname(targetFile), { recursive: true });
  writeFileSync(targetFile, updated);

  process.stdout.write(JSON.stringify({
    host,
    scope,
    target_file: targetFile,
    bundle_id: preset.bundle_id,
    skills: preset.skills,
    repo: preset.repo,
  }, null, 2) + "\n");
}

main();
