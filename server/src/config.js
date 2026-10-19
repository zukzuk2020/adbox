import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT) || 4000;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export const DB_DIR = process.env.DB_DIR || path.resolve(here, '../../db');
export const DATA_DIR = path.join(DB_DIR, 'data/json');
export const INPUT_DIR = path.join(DB_DIR, 'data/input');
export const ASSETS_DIR = path.join(DB_DIR, 'assets');
