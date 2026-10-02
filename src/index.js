const path = require('path');
const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const { Store } = require('./store');

const app = express();
const store = new Store(
  process.env.DATA_FILE ? path.resolve(process.env.DATA_FILE) : null);

app.use(express.json({ limit: '64kb' }));
if (config.logRequests) app.use(morgan('tiny'));

function validBookmark(body, partial) {
  if (!body || typeof body !== 'object') return 'body must be an object';
  if (!partial || body.url !== undefined) {
    if (typeof body.url !== 'string') return 'url is required';
    if (body.url.length > 2048) return 'url too long';
    if (!/^https?:\/\//.test(body.url)) return 'url must be absolute';
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) return 'tags must be an array';
    if (body.tags.length > 20) return 'too many tags';
    if (!body.tags.every((t) => typeof t === 'string' && t.length <= 40)) {
      return 'tags must be short strings';
    }
  }
  if (body.note !== undefined) {
    if (typeof body.note !== 'string') return 'note must be a string';
    if (body.note.length > 2000) return 'note too long';
  }
  return null;
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/bookmarks', (req, res) => {
  res.json(store.search(req.query.q, req.query.tag,
                        req.query.limit, req.query.offset));
});

app.post('/api/bookmarks', (req, res) => {
  const err = validBookmark(req.body, false);
  if (err) return res.status(400).json({ error: err });
  res.status(201).json(store.add(req.body));
});

app.patch('/api/bookmarks/:id', (req, res) => {
  const err = validBookmark(req.body, true);
  if (err) return res.status(400).json({ error: err });
  const row = store.update(Number(req.params.id), req.body);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

app.delete('/api/bookmarks/:id', (req, res) => {
  if (!store.remove(Number(req.params.id))) {
    return res.status(404).json({ error: 'not found' });
  }
  res.status(204).end();
});

// unknown routes stay JSON instead of Express' default HTML error page
app.use((req, res) => res.status(404).json({ error: 'not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

app.listen(config.port, () => console.log('listening on :' + config.port));
