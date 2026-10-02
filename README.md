# apilot

Tiny REST API for saving and tagging bookmarks

## Highlights

- Morgan logging and centralized error handler
- env-driven port, runs anywhere Node does
- REST endpoints: list / create / delete / search
- In-memory store with optional JSON persistence
- Request validation helpers, no framework magic

## Installation

```bash
npm install
npm run dev
```

## Examples

```bash
curl -X POST localhost:3000/api/bookmarks \
  -H 'content-type: application/json' \
  -d '{"url": "https://example.com", "tags": ["reading"]}'
```

## Project structure

```text
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── bug_report.md
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── development.md
│   └── usage.md
├── examples/
│   └── quickstart.md
├── src/
│   ├── config.js
│   ├── index.js
│   └── store.js
├── .gitattributes
├── .gitignore
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

## License

MIT licensed, see LICENSE.
