# skill-bundle-fabric

Develop, package, share, index, and host-route reusable skill bundles.

This repo provides one installable skill, `skill-bundle-fabric`. It treats a skill bundle as one config-driven unit:
- skills to install
- request shapes -> skill calls
- share artifacts
- registry/index metadata
- host memory blocks

Supported hosts:
- Codex: `AGENTS.md`
- Claude: `CLAUDE.md`
- OpenClaw: `MEMORY.md`

## Install

```bash
npx skills add https://github.com/unbrowse-ai/skill-bundle-fabric --skill skill-bundle-fabric
```

## Main flow

Build all bundle artifacts:

```bash
node scripts/build-bundle.mjs \
  --preset presets/unbrowse-workflows.json \
  --out dist
```

Write host memory:

```bash
node scripts/write-host-memory.mjs \
  --preset presets/unbrowse-workflows.json \
  --host claude \
  --scope agent
```

## Output artifacts

`build-bundle` writes:
- `bundle.json` — canonical bundle manifest
- `share.json` — file-share/p2p manifest
- `registry-entry.json` — backend/index ingestion payload
- `hosts/<host>/<file>` — host-ready memory snippets

## Preset shape

```json
{
  "bundle_id": "unbrowse-workflows",
  "title": "Unbrowse Workflow Bundle",
  "repo": "https://github.com/unbrowse-ai/unbrowse",
  "bootstrap_skill": "find-skills",
  "skills": ["skill-a", "skill-b"],
  "routes": [
    { "when": "the request is about X", "call": "skill-a" }
  ],
  "share": {
    "transport": "files",
    "manifest_path": "/.well-known/skill-bundles/unbrowse-workflows/share.json"
  },
  "index": {
    "slug": "unbrowse-workflows",
    "summary": "What this bundle is for",
    "tags": ["bundle", "workflow"]
  }
}
```

## Test

```bash
node --test tests/*.test.mjs
```
