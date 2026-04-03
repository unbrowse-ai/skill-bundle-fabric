import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tmpDirs = [];
const REPO_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test.afterEach(() => {
  while (tmpDirs.length > 0) {
    rmSync(tmpDirs.pop(), { recursive: true, force: true });
  }
});

test("mines codex history into bundle skill evidence", () => {
  const home = mkdtempSync(path.join(os.tmpdir(), "skill-bundle-history-"));
  tmpDirs.push(home);
  mkdirSync(path.join(home, ".codex"), { recursive: true });
  writeFileSync(path.join(home, ".codex", "history.jsonl"), [
    JSON.stringify({ text: "please mine local codex chat history and turn repeated local workflows into skills" }),
    JSON.stringify({ text: "update the readme and changelog for release notes alignment" }),
    "",
  ].join("\n"));

  const stdout = execFileSync(process.execPath, [
    "scripts/mine-history.mjs",
    "--preset", "presets/unbrowse-workflows.json",
  ], {
    cwd: REPO_ROOT,
    env: { ...process.env, HOME: home },
    encoding: "utf8",
  });

  const result = JSON.parse(stdout);
  const historyMiner = result.matches.find((entry) => entry.skill === "history-skill-miner");
  const docsSync = result.matches.find((entry) => entry.skill === "docs-release-sync");

  assert.equal(result.bundle_id, "unbrowse-workflows");
  assert.equal(result.history_samples, 2);
  assert.equal(historyMiner.hits, 1);
  assert.equal(historyMiner.matched, false);
  assert.equal(docsSync.hits, 1);
});
