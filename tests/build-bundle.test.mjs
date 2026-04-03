import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const tmpDirs = [];
const REPO_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test.afterEach(() => {
  while (tmpDirs.length > 0) {
    rmSync(tmpDirs.pop(), { recursive: true, force: true });
  }
});

test("builds bundle, share, registry, and host artifacts from one preset", () => {
  const outDir = mkdtempSync(path.join(os.tmpdir(), "skill-bundle-build-"));
  tmpDirs.push(outDir);

  const stdout = execFileSync(process.execPath, [
    "scripts/build-bundle.mjs",
    "--preset", "presets/unbrowse-workflows.json",
    "--out", outDir,
  ], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });

  const result = JSON.parse(stdout);
  const bundleDir = path.join(outDir, "unbrowse-workflows");
  const bundle = JSON.parse(readFileSync(path.join(bundleDir, "bundle.json"), "utf8"));
  const share = JSON.parse(readFileSync(path.join(bundleDir, "share.json"), "utf8"));
  const registry = JSON.parse(readFileSync(path.join(bundleDir, "registry-entry.json"), "utf8"));
  const claude = readFileSync(path.join(bundleDir, "hosts", "claude", "CLAUDE.md"), "utf8");

  assert.equal(result.bundle_id, "unbrowse-workflows");
  assert.equal(bundle.bundle_id, "unbrowse-workflows");
  assert.equal(bundle.fabric.skill, "skill-bundle-fabric");
  assert.equal(bundle.dependency_graph.nodes[0].skill, "skill-bundle-fabric");
  assert.equal(share.transport, "files");
  assert.match(share.install_commands.fabric, /skill-bundle-fabric/);
  assert.equal(registry.slug, "unbrowse-workflows");
  assert.equal(registry.fabric.skill, "skill-bundle-fabric");
  assert.match(result.files.join("\n"), /history-report\.json/);
  assert.match(claude, /call `skill-bundle-fabric`/);
  assert.match(claude, /call `main-actions-triage`/);
});
