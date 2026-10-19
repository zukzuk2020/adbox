import { notFound } from '../errors.js';
import { assetFiles } from './assetFiles.js';
import { BaseMiddleware } from './BaseMiddleware.js';

class AssetVersionsMiddleware extends BaseMiddleware {
  constructor() {
    super('asset_versions.json');
  }

  listForAsset = async (req, res) => {
    res.json(await this.where({ asset_id: req.asset.id }));
  };

  /** Requires assets.load first; rejects versions that belong to another asset. */
  load = async (req, res, next) => {
    req.version = await this.findOne({ id: req.valid.params.versionId, asset_id: req.asset.id });
    if (!req.version) throw notFound('Version');
    next();
  };

  get = async (req, res) => {
    const template = await assetFiles.findOne({ id: req.version.template_id, type: 'template' });
    if (!template) throw notFound('Template');
    res.json({ ...req.version, template_url: assetFiles.withUrl(template).url });
  };
}

export const assetVersions = new AssetVersionsMiddleware();
