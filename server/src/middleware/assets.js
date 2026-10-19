import { notFound } from '../errors.js';
import { BaseMiddleware } from './BaseMiddleware.js';

class AssetsMiddleware extends BaseMiddleware {
  constructor() {
    super('assets.json');
  }

  list = async (req, res) => {
    res.json(await this.all());
  };

  load = async (req, res, next) => {
    req.asset = await this.findById(req.valid.params.assetId);
    if (!req.asset) throw notFound('Asset');
    next();
  };
}

export const assets = new AssetsMiddleware();
