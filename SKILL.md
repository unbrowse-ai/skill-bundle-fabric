---
name: host-memory-router
description: Write executable skill-routing defaults into the right host memory file (`AGENTS.md`, `CLAUDE.md`, or `MEMORY.md`) so the host knows which installed skill to call for which request shape. Use when a reusable skill set should become part of agent/project memory across Codex, Claude, or OpenClaw.
user-invocable: true
---

# Host Memory Router

Core job:

- write host-aware memory blocks that tell the agent which skill to call when a request matches a known workflow

Use this skill when:

- a skill bundle should work outside one product-specific repo
- Codex, Claude, or OpenClaw should remember which skill to call for which request shape
- the routing rules should live in project or agent memory, not only in docs
- you need install commands and routing defaults baked into the same memory block

Do not use this skill for:

- building the domain skill itself
- publishing a marketplace/API skill
- writing free-form memory notes with no executable routing value

Workflow:

1. Pick the target host and memory scope.
2. Prepare a bundle config with repo, skills, and routing rules.
3. Run `node scripts/write-host-memory.mjs --preset presets/<name>.json --host <host> --scope <scope>`.
4. Verify the written file points to the right memory target and says which skill to call for each request shape.
5. Commit or share the resulting memory file plus the preset when needed.

Load-bearing rules:

- the memory block must tell the host which skill to call, not just what to install
- install commands and routing rules stay together
- prefer config-driven routing over hard-coded product prose
- support host-specific root files: `AGENTS.md`, `CLAUDE.md`, `MEMORY.md`
- if a host is unknown, stop instead of guessing
