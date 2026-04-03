# Host Targets

## Files

- Codex project memory: `./AGENTS.md`
- Codex agent memory: `~/.codex/AGENTS.md`
- Claude project memory: `./CLAUDE.md`
- Claude agent memory: `~/.claude/CLAUDE.md`
- OpenClaw project memory: `./MEMORY.md`
- OpenClaw agent memory: `$OPENCLAW_HOME/MEMORY.md`

## Routing Rule

- each route line must say: `If the request is about X, call Y`
- install commands live in the same managed block
- reruns replace the managed block instead of duplicating it

## Bundle Outputs

- `bundle.json` — canonical bundle manifest
- `share.json` — share/export manifest
- `registry-entry.json` — backend/index ingestion payload
- `hosts/<host>/<file>` — rendered host snippets
