# Quickstart

Fresh machine, five minutes.

```bash
npm install
npm run dev
```

Then:

```bash
curl -X POST localhost:3000/api/bookmarks \
  -H 'content-type: application/json' \
  -d '{"url": "https://example.com", "tags": ["reading"]}'
```

If nothing happens, check docs/usage.md first.
