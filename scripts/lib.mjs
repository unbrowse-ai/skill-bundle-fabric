import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
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
  const required = ["bundle_id", "title", "repo", "bootstrap_skill", "fabric", "skills", "routes", "share", "index"];
  for (const key of required) {
    if (!(key in preset)) throw new Error(`Missing preset field: ${key}`);
  }
  if (!preset.fabric?.repo || !preset.fabric?.skill) throw new Error("fabric.repo + fabric.skill required");
  if (!Array.isArray(preset.skills) || preset.skills.length === 0) throw new Error("skills[] required");
  if (!Array.isArray(preset.routes) || preset.routes.length === 0) throw new Error("routes[] required");
  if (!preset.share?.manifest_path) throw new Error("share.manifest_path required");
  if (!preset.index?.slug || !preset.index?.summary || !Array.isArray(preset.index?.tags)) {
    throw new Error("index.slug, index.summary, index.tags[] required");
  }
  if (preset.history) {
    if (!Array.isArray(preset.history.sources) || !Array.isArray(preset.history.skills)) {
      throw new Error("history.sources[] and history.skills[] required when history exists");
    }
  }
  if (preset.dependency_graph) {
    if (!Array.isArray(preset.dependency_graph.nodes) || preset.dependency_graph.nodes.length === 0) {
      throw new Error("dependency_graph.nodes[] required when dependency_graph exists");
    }
  }
  for (const route of preset.routes) {
    if (!route.when || !route.call) throw new Error("each route needs when + call");
    if (route.alternatives && !Array.isArray(route.alternatives)) {
      throw new Error("route.alternatives must be an array when present");
    }
  }
  return preset;
}

export function fabricInstallCommand(preset) {
  return `npx skills add ${preset.fabric.repo} --skill ${preset.fabric.skill} --yes`;
}

export function bundleInstallCommands(preset) {
  return preset.skills.map((skill) => `npx skills add ${preset.repo} --skill ${skill} --yes`);
}

export function installCommands(preset) {
  return [fabricInstallCommand(preset), ...bundleInstallCommands(preset)];
}

export function buildHostTargets() {
  return [
    { host: "codex", target_path: "./AGENTS.md", snippet_path: "hosts/codex/AGENTS.md" },
    { host: "claude", target_path: "./CLAUDE.md", snippet_path: "hosts/claude/CLAUDE.md" },
    { host: "openclaw", target_path: "./MEMORY.md", snippet_path: "hosts/openclaw/MEMORY.md" },
  ];
}

export function renderMemoryBlock(preset, host) {
  const rootCommand = fabricInstallCommand(preset);
  const commands = bundleInstallCommands(preset);
  const lines = [
    MARKER_BEGIN,
    `## ${preset.title} (${host})`,
    "",
    "Install bundle fabric:",
    `- \`${rootCommand}\``,
    "",
    "Install bundled skills:",
    ...commands.map((command) => `- \`${command}\``),
    "",
    "Bundle entrypoint:",
    `- If the request is about mining chat history into skills, fabricating a portable bundle, sharing it, indexing it, or writing host routing memory, call \`${preset.fabric.skill}\`.`,
    "",
    "Skill-call routing defaults:",
    ...preset.routes.map((route) => {
      const alternatives = Array.isArray(route.alternatives) && route.alternatives.length > 0
        ? ` If unavailable or the user asks for an alternative, use ${route.alternatives.map((skill) => `\`${skill}\``).join(" or ")}.`
        : "";
      return `- If ${route.when}, call \`${route.call}\`.${alternatives}`;
    }),
    "",
    `Use \`${preset.bootstrap_skill}\` first when available to confirm/install the right skill, then call \`${preset.fabric.skill}\` or the routed bundle skill.`,
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
    fabric: preset.fabric,
    skills: preset.skills,
    routes: preset.routes,
    dependency_graph: preset.dependency_graph,
    install_commands: {
      fabric: fabricInstallCommand(preset),
      bundle_skills: bundleInstallCommands(preset),
    },
    host_targets: buildHostTargets(),
    history: preset.history,
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
    fabric: preset.fabric,
    skills: preset.skills,
    dependency_graph: preset.dependency_graph,
    install_commands: {
      fabric: fabricInstallCommand(preset),
      bundle_skills: bundleInstallCommands(preset),
    },
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
    fabric: preset.fabric,
    skills: preset.skills,
    routes: preset.routes,
    dependency_graph: preset.dependency_graph,
    history: preset.history,
  };
}

export function expandHome(inputPath) {
  if (!inputPath.startsWith("~/")) return inputPath;
  return path.join(resolveHome(), inputPath.slice(2));
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function loadHistoryTexts(preset) {
  const out = [];
  const sources = preset.history?.sources ?? [];
  for (const source of sources) {
    const resolved = expandHome(source);
    if (!existsSync(resolved)) continue;
    const statIsDir = statSync(resolved).isDirectory();

    if (statIsDir) {
      for (const entry of readdirSync(resolved).filter((name) => name.endsWith(".jsonl"))) {
        out.push(...parseHistoryFile(path.join(resolved, entry)));
      }
      continue;
    }
    out.push(...parseHistoryFile(resolved));
  }
  return out;
}

function parseHistoryFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line);
        return extractTexts(parsed);
      } catch {
        return [];
      }
    })
    .map(normalizeText)
    .filter(Boolean);
}

function extractTexts(parsed) {
  if (typeof parsed?.text === "string") return [parsed.text];
  if (typeof parsed?.thread_name === "string") return [parsed.thread_name];
  if (parsed?.type === "response_item" && parsed?.payload?.type === "message" && parsed?.payload?.role === "user") {
    const content = Array.isArray(parsed.payload.content) ? parsed.payload.content : [];
    return content.filter((item) => item?.type === "input_text" && typeof item?.text === "string").map((item) => item.text);
  }
  return [];
}

export function scoreHistoryMatches(preset, texts) {
  const skillDefs = preset.history?.skills ?? [];
  return skillDefs.map((def) => {
    const matchers = def.matchers.map((matcher) => normalizeText(matcher));
    const evidence = texts.filter((text) => matchers.some((matcher) => text.includes(matcher))).slice(0, 8);
    return {
      skill: def.skill,
      min_hits: def.min_hits,
      hits: evidence.length,
      matched: evidence.length >= def.min_hits,
      evidence,
    };
  });
}

export function buildHistoryReport(preset) {
  if (!preset.history) return null;
  const texts = loadHistoryTexts(preset);
  return {
    bundle_id: preset.bundle_id,
    history_samples: texts.length,
    matches: scoreHistoryMatches(preset, texts),
  };
}

export function writeBundleArtifacts(preset, outRoot) {
  const bundleDir = path.join(outRoot, preset.bundle_id);
  const historyReport = buildHistoryReport(preset);

  writeJson(path.join(bundleDir, "bundle.json"), buildBundleManifest(preset));
  writeJson(path.join(bundleDir, "share.json"), buildShareManifest(preset));
  writeJson(path.join(bundleDir, "registry-entry.json"), buildRegistryEntry(preset));
  if (historyReport) writeJson(path.join(bundleDir, "history-report.json"), historyReport);

  for (const target of buildHostTargets()) {
    const outputPath = path.join(bundleDir, target.snippet_path);
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, renderMemoryBlock(preset, target.host));
  }

  return {
    bundle_id: preset.bundle_id,
    output_dir: bundleDir,
    files: [
      "bundle.json",
      "share.json",
      "registry-entry.json",
      ...(historyReport ? ["history-report.json"] : []),
      ...buildHostTargets().map((target) => target.snippet_path),
    ],
    history_report: historyReport ? path.join(bundleDir, "history-report.json") : null,
  };
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}
