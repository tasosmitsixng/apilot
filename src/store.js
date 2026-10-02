// tiny in-memory store with optional file persistence
const fs = require('fs');

// client-writable fields; id/createdAt are server-owned
const WRITABLE = ['url', 'tags', 'note'];

function pickWritable(body) {
  const out = {};
  for (const k of WRITABLE) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

class Store {
  constructor(file) {
    this.file = file || null;
    this.items = new Map();
    this.seq = 1;
    if (this.file && fs.existsSync(this.file)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        data.items.forEach((it) => this.items.set(it.id, it));
        this.seq = data.seq || this.items.size + 1;
      } catch (err) {
        // corrupt data file (crash mid-write etc.): back it up and start
        // empty instead of crashing the process on every boot
        try {
          fs.renameSync(this.file, this.file + '.broken-' + Date.now());
        } catch { /* best effort */ }
        console.error('store: data file unreadable, starting empty:',
                      err.message);
      }
    }
  }

  add(body) {
    const id = this.seq++;
    // system fields last: the client can never override id/createdAt
    const row = Object.assign(pickWritable(body), {
      id, createdAt: Date.now(),
    });
    this.items.set(id, row);
    this.flush();
    return row;
  }

  update(id, body) {
    const row = this.items.get(id);
    if (!row) return null;
    Object.assign(row, pickWritable(body));
    this.flush();
    return row;
  }

  remove(id) {
    const ok = this.items.delete(id);
    if (ok) this.flush();
    return ok;
  }

  search(q, tag, limit, offset) {
    const needle = q ? String(q).toLowerCase() : null;
    const out = [...this.items.values()].filter((it) => {
      const hay = (it.url + ' ' + (it.note || '') + ' '
        + (it.tags || []).join(' ')).toLowerCase();
      const hitQ = !needle || hay.includes(needle);
      const hitT = !tag || (it.tags || []).includes(tag);
      return hitQ && hitT;
    });
    out.sort((a, b) => b.createdAt - a.createdAt);
    const start = Math.max(0, Number(offset) || 0);
    const end = limit ? start + Math.min(200, Number(limit)) : undefined;
    return out.slice(start, end);
  }

  flush() {
    if (!this.file) return;
    const data = { seq: this.seq, items: [...this.items.values()] };
    // write temp + rename: a crash mid-write never leaves a truncated file
    const tmp = this.file + '.tmp';
    try {
      fs.writeFileSync(tmp, JSON.stringify(data));
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error('store: flush failed:', err.message);
    }
  }
}

module.exports = { Store };
