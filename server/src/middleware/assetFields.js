import { BaseMiddleware } from './BaseMiddleware.js';

class AssetFieldsMiddleware extends BaseMiddleware {
  constructor() {
    super('asset_fields.json');
  }
}

export const assetFields = new AssetFieldsMiddleware();
