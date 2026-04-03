#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const MARKER_BEGIN = "<!-- HOST_MEMORY_ROUTER:BEGIN -->";
const MARKER_END = "<!-- HOST_MEMORY_ROUTER:END -->";

function parseArgs(argv) {
  const flags = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }
    flags[key] = next;
    i += 1;
  }
  return flags;
}

function resolveHome() {
  return process.env.HOME || os.homedir();
}

function readPreset(presetPath) {
  if (!presetPath) {
    throw new Error("--preset is required");
  }
  return JSON.parse(readFileSync(path.resolve(presetPath), "utf8"));
}

function targetFileFor(host, scope, cwd) {
  const home = resolveHome();
  const projectFiles = {
    codex: path.join(cwd, "AGENTS.md"),
    claude: path.join(cwd, "CLAUDE.md"),
    openclaw: path.join(cwd, "MEMORY.md"),
  };
  const agentFiles = {
    codex: path.join(home, ".codex", "AGENTS.md"),
    claude: path.join(home, ".claude", "CLAUDE.md"),
    openclaw: process.env.OPENCLAW_HOME ? path.join(process.env.OPENCLAW_HOME, "MEMORY.md") : null,
  };

  if (!(host in projectFiles)) throw new Error(`Unsupported host: ${host}`);
  if (scope === "project") return projectFiles[host];
  if (scope === "agent") {
    if (!agentFiles[host]) throw new Error(`No agent memory target for host: ${host}`);
    return agentFiles[host];
  }

  if (existsSync(projectFiles[host])) return projectFiles[host];
  if (agentFiles[host] && existsSync(agentFiles[host])) return agentFiles[host];
  return projectFiles[host];
}

function installCommands(preset) {
  return preset.skills.map((skill) => `- \`npx skills add ${preset.repo} --skill ${skill} --yes\``);
}

function renderBlock(preset, host) {
  const lines = [
    MARKER_BEGIN,
    `## ${preset.title} (${host})`,
    "",
    "Install from repo:",
    ...installCommands(preset),
    "",
    "Skill-call routing defaults:",
    ...preset.routes.map((route) => `- If ${route.when}, call \`${route.call}\`.`),
    "",
    `Use \`${preset.bootstrap_skill}\` first when available to confirm/install the right skill, then call that skill.`,
    MARKER_END,
    "",
  ];
  return lines.join("\n");
}

function upsertBlock(existing, block) {
  if (existing.includes(MARKER_BEGIN) && existing.includes(MARKER_END)) {
    return existing.replace(new RegExp(`${MARKER_BEGIN}[\\s\\S]*?${MARKER_END}\\n?`, "m"), block);
  }
  return `${existing.replace(/\s*$/, "")}${existing.trim().length > 0 ? "\n\n" : ""}${block}`;
}

function main() {
  const flags = parseArgs(process.argv);
  const host = String(flags.host || "");
  const scope = String(flags.scope || "auto");
  const cwd = path.resolve(String(flags.cwd || process.cwd()));
  const preset = readPreset(flags.preset);
  const targetFile = targetFileFor(host, scope, cwd);
  const block = renderBlock(preset, host);
  const existing = existsSync(targetFile) ? readFileSync(targetFile, "utf8") : "";
  const updated = upsertBlock(existing, block);

  mkdirSync(path.dirname(targetFile), { recursive: true });
  writeFileSync(targetFile, updated);

  process.stdout.write(JSON.stringify({
    host,
    scope,
    target_file: targetFile,
    skills: preset.skills,
    repo: preset.repo,
  }, null, 2) + "\n");
}

main();
