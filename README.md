# skill-memory-router

Config-driven host memory routing for skills.

This repo provides one reusable skill, `host-memory-router`. It writes executable routing blocks into the right host memory file so the host knows which installed skill to call for which request shape.

Supported targets:
- Codex: `AGENTS.md`
- Claude: `CLAUDE.md`
- OpenClaw: `MEMORY.md`

## Install

```bash
npx skills add https://github.com/unbrowse-ai/skill-memory-router --skill host-memory-router
```

## Use

With the bundled Unbrowse preset:

```bash
node scripts/write-host-memory.mjs \
  --preset presets/unbrowse-workflows.json \
  --host claude \
  --scope agent
```

Generic use:

```bash
node scripts/write-host-memory.mjs \
  --preset /path/to/your-bundle.json \
  --host codex \
  --scope project
```

## Preset format

```json
{
  "title": "bundle name",
  "repo": "https://github.com/org/repo",
  "bootstrap_skill": "find-skills",
  "skills": ["skill-a", "skill-b"],
  "routes": [
    {
      "when": "request is about X",
      "call": "skill-a"
    }
  ]
}
```

## Test

```bash
node --test tests/*.test.mjs
```
