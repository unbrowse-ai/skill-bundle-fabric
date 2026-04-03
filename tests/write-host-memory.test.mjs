import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const tmpDirs = [];

test.afterEach(() => {
  while (tmpDirs.length > 0) {
    rmSync(tmpDirs.pop(), { recursive: true, force: true });
  }
});

test("writes Claude agent memory with executable routing rules", () => {
  const home = mkdtempSync(path.join(os.tmpdir(), "skill-memory-router-"));
  tmpDirs.push(home);
  mkdirSync(path.join(home, ".claude"), { recursive: true });

  const stdout = execFileSync("node", [
    "scripts/write-host-memory.mjs",
    "--preset", "presets/unbrowse-workflows.json",
    "--host", "claude",
    "--scope", "agent",
    "--cwd", home,
  ], {
    cwd: "/tmp/skill-memory-router",
    env: { ...process.env, HOME: home },
    encoding: "utf8",
  });

  const result = JSON.parse(stdout);
  const target = path.join(home, ".claude", "CLAUDE.md");
  const written = readFileSync(target, "utf8");

  assert.equal(result.target_file, target);
  assert.match(written, /call `history-skill-miner`/);
  assert.match(written, /call `docs-release-sync`/);
});

test("prefers project memory in auto scope when the file exists", () => {
  const home = mkdtempSync(path.join(os.tmpdir(), "skill-memory-router-project-"));
  tmpDirs.push(home);
  mkdirSync(path.join(home, ".codex"), { recursive: true });
  execFileSync("sh", ["-lc", "printf '# local\\n' > AGENTS.md"], { cwd: home });

  execFileSync("node", [
    "scripts/write-host-memory.mjs",
    "--preset", "presets/unbrowse-workflows.json",
    "--host", "codex",
    "--scope", "auto",
    "--cwd", home,
  ], {
    cwd: "/tmp/skill-memory-router",
    env: { ...process.env, HOME: home },
    encoding: "utf8",
  });

  const written = readFileSync(path.join(home, "AGENTS.md"), "utf8");
  assert.match(written, /HOST_MEMORY_ROUTER/);
});
