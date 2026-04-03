# Host Targets

## Files

- Codex project memory: `./AGENTS.md`
- Codex agent memory: `~/.codex/AGENTS.md`
- Claude project memory: `./CLAUDE.md`
- Claude agent memory: `~/.claude/CLAUDE.md`
- OpenClaw project memory: `./MEMORY.md`
- OpenClaw agent memory: `$OPENCLAW_HOME/MEMORY.md`

## Rule

- write executable routing, not passive notes
- each route line should say: `If the request is about X, call Y`
- install commands should sit in the same block as routing rules
- replace the old managed block on rerun instead of duplicating it
