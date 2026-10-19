import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { ValidationError } from 'yup';
import { ASSETS_DIR, CLIENT_ORIGIN, PORT } from './config.js';
import { HttpError } from './errors.js';
import { assetFilesRouter } from './routes/assetFiles.js';
import { assetsRouter } from './routes/assets.js';
import { locationsRouter } from './routes/locations.js';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use('/files/images', express.static(path.join(ASSETS_DIR, 'images')));
app.use('/files/templates', express.static(path.join(ASSETS_DIR, 'templates')));

app.use('/api/v1', locationsRouter, assetsRouter, assetFilesRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((error, req, res, next) => {
  if (error instanceof ValidationError) {
    const errors = (error.inner.length ? error.inner : [error]).map((e) => ({
      field_id: e.params?.field_id,
      message: e.message,
    }));
    return res.status(400).json({ error: 'Invalid request', errors });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, errors: error.errors });
  }
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`AdBox server listening on http://localhost:${PORT}`));
