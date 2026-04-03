---
name: skill-bundle-fabric
description: Develop, package, share, index, and host-route reusable skill bundles. Use when a workflow should become one portable installable skill set with registry metadata, share artifacts, and executable host-memory routing across Codex, Claude, or OpenClaw.
user-invocable: true
---

# Skill Bundle Fabric

Core job:

- turn a reusable workflow into one portable skill bundle that can be developed, shared, indexed, and routed through host memory

Use this skill when:

- a workflow needs to become a portable multi-skill bundle
- the bundle should ship install commands, routing rules, and registry metadata together
- the same bundle should work across Codex, Claude, or OpenClaw
- the bundle should be shareable by files now and indexable by backend later

Do not use this skill for:

- building one domain skill with no bundle/share/index concern
- publishing runtime API routes to a marketplace
- writing free-form memory notes with no executable routing value

Workflow:

1. Start from the workflow bundle outcome: skills, routes, share path, index metadata.
2. Encode that in a preset JSON.
3. Run `node scripts/build-bundle.mjs --preset presets/<name>.json --out dist`.
4. Run `node scripts/write-host-memory.mjs --preset presets/<name>.json --host <host> --scope <scope>`.
5. Verify the generated bundle, share manifest, registry entry, and host-memory block.
6. Publish or share the generated artifacts with the target repo/host/backend.

Load-bearing rules:

- one bundle preset is the source of truth
- install commands, routing rules, share metadata, and index metadata stay derived from the same preset
- the memory block must say which skill to call, not just what to install
- support host-specific root files: `AGENTS.md`, `CLAUDE.md`, `MEMORY.md`
- build artifacts must be backend-ready even if the backend is not live yet
