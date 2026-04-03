# Preset Schema

Required fields:

- `bundle_id`
- `title`
- `fabric.repo`
- `fabric.skill`
- `repo`
- `bootstrap_skill`
- `skills[]`
- `routes[]`
- `share.transport`
- `share.manifest_path`
- `index.slug`
- `index.summary`
- `index.tags[]`

Optional fields:

- `dependency_graph.nodes[]`
- `history.sources[]`
- `history.skills[]`

## Route fields

- `when`: request-shape clause
- `call`: skill name to invoke
- `alternatives[]`: optional fallback skills when the user asks for substitutes

## History fields

- `sources[]`: file or directory sources to scan
- `skills[].skill`: target skill name
- `skills[].min_hits`: minimum match count
- `skills[].matchers[]`: plain-text matcher phrases

## Fabric fields

- `fabric.repo`: install source for the umbrella orchestrator skill
- `fabric.skill`: umbrella skill name hosts should call for bundle-level work

## Dependency graph fields

- `nodes[].skill`: concrete skill node
- `nodes[].provides[]`: capabilities exported by that skill
- `nodes[].requires[]`: required capabilities or upstream skills
- `nodes[].alternatives[]`: interchangeable substitutes

## Generated bundle manifest

- repo/install truth
- bundle-entry truth
- routing truth
- dependency DAG truth
- host targets
- derived install commands

## Generated registry entry

- backend/index oriented
- keeps `slug`, `summary`, `tags`, `skills`, `routes`
- safe to POST to a future registry backend
