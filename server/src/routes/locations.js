import { Router } from 'express';
import { locations } from '../middleware/locations.js';

export const locationsRouter = Router();

locationsRouter.get('/corporate/locations', locations.listCorporate);
locationsRouter.get('/local/locations', locations.listLocal);
