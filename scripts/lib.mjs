import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const MARKER_BEGIN = "<!-- SKILL_BUNDLE_FABRIC:BEGIN -->";
export const MARKER_END = "<!-- SKILL_BUNDLE_FABRIC:END -->";
export const HOST_FILES = {
  codex: "AGENTS.md",
  claude: "CLAUDE.md",
  openclaw: "MEMORY.md",
};

export function parseArgs(argv) {
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

export function resolveHome() {
  return process.env.HOME || os.homedir();
}

export function readPreset(presetPath) {
  if (!presetPath) throw new Error("--preset is required");
  return JSON.parse(readFileSync(path.resolve(presetPath), "utf8"));
}

export function validatePreset(preset) {
  const required = ["bundle_id", "title", "repo", "bootstrap_skill", "skills", "routes", "share", "index"];
  for (const key of required) {
    if (!(key in preset)) throw new Error(`Missing preset field: ${key}`);
  }
  if (!Array.isArray(preset.skills) || preset.skills.length === 0) throw new Error("skills[] required");
  if (!Array.isArray(preset.routes) || preset.routes.length === 0) throw new Error("routes[] required");
  if (!preset.share?.manifest_path) throw new Error("share.manifest_path required");
  if (!preset.index?.slug || !preset.index?.summary || !Array.isArray(preset.index?.tags)) {
    throw new Error("index.slug, index.summary, index.tags[] required");
  }
  for (const route of preset.routes) {
    if (!route.when || !route.call) throw new Error("each route needs when + call");
  }
  return preset;
}

export function installCommands(preset) {
  return preset.skills.map((skill) => `npx skills add ${preset.repo} --skill ${skill} --yes`);
}

export function buildHostTargets() {
  return [
    { host: "codex", target_path: "./AGENTS.md", snippet_path: "hosts/codex/AGENTS.md" },
    { host: "claude", target_path: "./CLAUDE.md", snippet_path: "hosts/claude/CLAUDE.md" },
    { host: "openclaw", target_path: "./MEMORY.md", snippet_path: "hosts/openclaw/MEMORY.md" },
  ];
}

export function renderMemoryBlock(preset, host) {
  const commands = installCommands(preset);
  const lines = [
    MARKER_BEGIN,
    `## ${preset.title} (${host})`,
    "",
    "Install from repo:",
    ...commands.map((command) => `- \`${command}\``),
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

export function upsertManagedBlock(existing, block) {
  if (existing.includes(MARKER_BEGIN) && existing.includes(MARKER_END)) {
    return existing.replace(new RegExp(`${MARKER_BEGIN}[\\s\\S]*?${MARKER_END}\\n?`, "m"), block);
  }
  return `${existing.replace(/\s*$/, "")}${existing.trim().length > 0 ? "\n\n" : ""}${block}`;
}

export function targetFileFor(host, scope, cwd) {
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

export function buildBundleManifest(preset) {
  return {
    bundle_id: preset.bundle_id,
    title: preset.title,
    repo: preset.repo,
    bootstrap_skill: preset.bootstrap_skill,
    skills: preset.skills,
    routes: preset.routes,
    install_commands: installCommands(preset),
    host_targets: buildHostTargets(),
    share: preset.share,
    index: preset.index,
  };
}

export function buildShareManifest(preset) {
  return {
    bundle_id: preset.bundle_id,
    transport: preset.share.transport,
    manifest_path: preset.share.manifest_path,
    repo: preset.repo,
    skills: preset.skills,
    install_commands: installCommands(preset),
    host_targets: buildHostTargets(),
  };
}

export function buildRegistryEntry(preset) {
  return {
    slug: preset.index.slug,
    title: preset.title,
    summary: preset.index.summary,
    tags: preset.index.tags,
    repo: preset.repo,
    bundle_id: preset.bundle_id,
    bootstrap_skill: preset.bootstrap_skill,
    skills: preset.skills,
    routes: preset.routes,
  };
}
