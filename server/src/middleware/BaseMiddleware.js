import fs from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from '../config.js';

const matches = (row, match) => Object.entries(match).every(([key, value]) => row[key] === value);

const nextId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

/** CRUD over one JSON file under db/data/json. */
export class BaseMiddleware {
  #writeQueue = Promise.resolve();

  constructor(fileName) {
    this.filePath = path.join(DATA_DIR, fileName);
  }

  async all() {
    return JSON.parse(await fs.readFile(this.filePath, 'utf8'));
  }

  async where(match) {
    return (await this.all()).filter((row) => matches(row, match));
  }

  async findOne(match) {
    return (await this.where(match))[0] ?? null;
  }

  async findById(id) {
    return this.findOne({ id });
  }

  create(record) {
    return this.mutate((rows) => {
      const row = { id: nextId(rows), ...record };
      rows.push(row);
      return row;
    });
  }

  update(id, patch) {
    return this.mutate((rows) => {
      const row = rows.find((r) => r.id === id);
      if (row) Object.assign(row, patch);
      return row ?? null;
    });
  }

  remove(id) {
    return this.mutate((rows) => {
      const index = rows.findIndex((r) => r.id === id);
      return index === -1 ? null : rows.splice(index, 1)[0];
    });
  }

  /** Inserts or updates each record, matching existing rows on the given unique keys. */
  upsertMany(records, keys) {
    return this.mutate((rows) =>
      records.map((record) => {
        const match = Object.fromEntries(keys.map((key) => [key, record[key]]));
        const row = rows.find((r) => matches(r, match));
        if (row) return Object.assign(row, record);
        const created = { id: nextId(rows), ...record };
        rows.push(created);
        return created;
      }),
    );
  }

  /**
   * Writes are queued so overlapping requests never interleave, and each write goes to a
   * temp file that is renamed over the original so readers never see a partial file.
   */
  mutate(change) {
    const run = this.#writeQueue.then(async () => {
      const rows = await this.all();
      const result = change(rows);
      const tmpPath = `${this.filePath}.${process.pid}.tmp`;
      await fs.writeFile(tmpPath, `${JSON.stringify(rows, null, 2)}\n`);
      await fs.rename(tmpPath, this.filePath);
      return result;
    });
    this.#writeQueue = run.catch(() => {});
    return run;
  }
}
