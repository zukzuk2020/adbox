import { BaseMiddleware } from './BaseMiddleware.js';

const withUrl = (file) => ({ ...file, url: `/files/${file.file_path}` });

class AssetFilesMiddleware extends BaseMiddleware {
  constructor() {
    super('asset_files.json');
  }

  withUrl = withUrl;

  list = async (req, res) => {
    const { type } = req.valid.query;
    const files = type ? await this.where({ type }) : await this.all();
    res.json(files.map(withUrl));
  };
}

export const assetFiles = new AssetFilesMiddleware();
