# skill-bundle-fabric

Develop, mine, package, share, index, and host-route reusable skill bundles.

This repo provides one installable skill, `skill-bundle-fabric`. It treats a skill bundle as one config-driven unit:
- one bundle entry skill
- skills to install
- dependency DAG
- request shapes -> skill calls
- history-mined evidence
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

Fabricate the full bundle:

```bash
node scripts/fabricate-bundle.mjs \
  --preset presets/unbrowse-workflows.json \
  --out dist \
  --host claude \
  --scope agent
```

Inspect history matches only:

```bash
node scripts/mine-history.mjs \
  --preset presets/unbrowse-workflows.json
```

Compatibility scripts:
- `scripts/build-bundle.mjs` — artifact-only build
- `scripts/write-host-memory.mjs` — host-memory-only write

## Output artifacts

`fabricate-bundle` writes:
- `bundle.json` — canonical bundle manifest
- `share.json` — file-share/p2p manifest
- `registry-entry.json` — backend/index ingestion payload
- `history-report.json` — local chat-history evidence for bundled workflow demand
- `hosts/<host>/<file>` — host-ready memory snippets

## Preset shape

```json
{
  "bundle_id": "unbrowse-workflows",
  "title": "Unbrowse Workflow Bundle",
  "fabric": {
    "repo": "https://github.com/unbrowse-ai/skill-bundle-fabric",
    "skill": "skill-bundle-fabric"
  },
  "repo": "https://github.com/unbrowse-ai/unbrowse",
  "bootstrap_skill": "find-skills",
  "skills": ["skill-a", "skill-b"],
  "dependency_graph": {
    "nodes": [
      {
        "skill": "skill-bundle-fabric",
        "provides": ["bundle-fabrication"],
        "requires": ["skill-a-capability"],
        "alternatives": []
      }
    ]
  },
  "routes": [
    { "when": "the request is about X", "call": "skill-a", "alternatives": ["skill-b"] }
  ],
  "history": {
    "sources": ["~/.codex/history.jsonl"],
    "skills": [
      { "skill": "skill-a", "min_hits": 2, "matchers": ["x", "y"] }
    ]
  },
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
