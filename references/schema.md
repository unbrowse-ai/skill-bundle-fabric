# Preset Schema

Required fields:

- `bundle_id`
- `title`
- `repo`
- `bootstrap_skill`
- `skills[]`
- `routes[]`
- `share.transport`
- `share.manifest_path`
- `index.slug`
- `index.summary`
- `index.tags[]`

## Route fields

- `when`: request-shape clause
- `call`: skill name to invoke

## Generated bundle manifest

- repo/install truth
- routing truth
- host targets
- derived install commands

## Generated registry entry

- backend/index oriented
- keeps `slug`, `summary`, `tags`, `skills`, `routes`
- safe to POST to a future registry backend
