#!/usr/bin/env node

import path from "node:path";
import { parseArgs, readPreset, validatePreset, writeBundleArtifacts } from "./lib.mjs";

function main() {
  const flags = parseArgs(process.argv);
  const outRoot = path.resolve(String(flags.out || "dist"));
  const preset = validatePreset(readPreset(flags.preset));
  process.stdout.write(JSON.stringify(writeBundleArtifacts(preset, outRoot), null, 2) + "\n");
}

main();
