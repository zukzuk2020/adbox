import { Router } from 'express';
import { assetLocationFieldValues } from '../middleware/assetLocationFieldValues.js';
import { assets } from '../middleware/assets.js';
import { assetVersionFields } from '../middleware/assetVersionFields.js';
import { assetVersions } from '../middleware/assetVersions.js';
import { locations } from '../middleware/locations.js';
import { assetParams, statesBody, validate, valuesBody, valuesParams, versionParams } from '../validators.js';

export const assetsRouter = Router();

const VERSION = '/asset/:assetId/version/:versionId';
const loadVersion = [assets.load, assetVersions.load];

assetsRouter.get('/assets', assets.list);

assetsRouter.get('/asset/:assetId/version', validate({ params: assetParams }), assets.load, assetVersions.listForAsset);

assetsRouter.get(VERSION, validate({ params: versionParams }), loadVersion, assetVersions.get);

assetsRouter.get(`${VERSION}/fields`, validate({ params: versionParams }), loadVersion, assetVersionFields.list);

assetsRouter.put(
  `${VERSION}/state`,
  validate({ params: versionParams, body: statesBody }),
  loadVersion,
  assetVersionFields.updateStates,
);

assetsRouter.get(
  `${VERSION}/location/:locationId/values`,
  validate({ params: valuesParams }),
  loadVersion,
  locations.load,
  assetLocationFieldValues.list,
);

assetsRouter.post(
  `${VERSION}/location/:locationId/values`,
  validate({ params: valuesParams, body: valuesBody }),
  loadVersion,
  locations.load,
  assetLocationFieldValues.save,
);
