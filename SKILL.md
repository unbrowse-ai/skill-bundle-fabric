---
name: skill-bundle-fabric
description: Develop, package, share, index, and host-route reusable skill bundles. Use when a workflow should become one portable installable skill set with registry metadata, share artifacts, and executable host-memory routing across Codex, Claude, or OpenClaw.
user-invocable: true
---

# Skill Bundle Fabric

Core job:

- turn a reusable workflow into one portable skill bundle that mines history, emits install/share/index artifacts, and writes executable host routing from one preset

Use this skill when:

- a workflow needs to become one portable installable bundle, not a pile of adjacent scripts
- the bundle should ship install commands, routing rules, share artifacts, registry metadata, and host memory together
- local chat history should help justify or refresh the bundled workflow surface
- the same bundle should work across Codex, Claude, or OpenClaw
- the bundle should be shareable by files now and indexable by backend later, with one entry skill over the child DAG

Do not use this skill for:

- building one domain skill with no bundle/share/index concern
- publishing runtime API routes to a marketplace
- writing free-form memory notes with no executable routing value

Workflow:

1. Start from the bundle outcome: one entry skill, child skills, routes, share path, index metadata, host targets.
2. Encode that once in `presets/<name>.json`, including the bundle entry skill and dependency DAG.
3. Run `node scripts/fabricate-bundle.mjs --preset presets/<name>.json --out dist --host <host> --scope <scope>`.
4. Inspect `history-report.json`, `bundle.json`, `share.json`, `registry-entry.json`, and the host memory block.
5. Publish or share the generated artifacts with the target repo/host/backend.

Load-bearing rules:

- one bundle preset is the source of truth
- one entry skill owns the bundle-level job; child skills stay underneath it
- install commands, routing rules, share metadata, index metadata, and host memory stay derived from the same preset
- the memory block must say which skill to call, not just what to install
- dependency edges and alternatives belong in the preset, not hidden in prose
- support host-specific root files: `AGENTS.md`, `CLAUDE.md`, `MEMORY.md`
- build artifacts must be backend-ready even if the backend is not live yet
