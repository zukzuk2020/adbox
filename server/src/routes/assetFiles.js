import { Router } from 'express';
import { assetFiles } from '../middleware/assetFiles.js';
import { assetFilesQuery, validate } from '../validators.js';

export const assetFilesRouter = Router();

assetFilesRouter.get('/asset_files', validate({ query: assetFilesQuery }), assetFiles.list);
