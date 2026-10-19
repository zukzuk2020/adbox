import { invalid } from '../errors.js';
import { assetFields } from './assetFields.js';
import { BaseMiddleware } from './BaseMiddleware.js';

class AssetVersionFieldsMiddleware extends BaseMiddleware {
  constructor() {
    super('asset_version_fields.json');
  }

  /** The version's fields joined with their shared definitions, in template order. */
  async forVersion(versionId) {
    const [versionFields, fields] = await Promise.all([this.where({ asset_version_id: versionId }), assetFields.all()]);
    return versionFields.map((vf) => {
      const { id, ...definition } = fields.find((f) => f.id === vf.field_id);
      return { ...definition, ...vf };
    });
  }

  list = async (req, res) => {
    res.json(await this.forVersion(req.version.id));
  };

  updateStates = async (req, res) => {
    const fields = await this.forVersion(req.version.id);
    const errors = [];
    for (const { field_id, state } of req.valid.body.fields) {
      const field = fields.find((f) => f.field_id === field_id);
      if (!field) errors.push({ field_id, message: 'Field is not part of this version' });
      else if (!field.allowed_states.includes(state)) {
        errors.push({ field_id, message: `${field.name} cannot use the "${state}" state` });
      }
    }
    if (errors.length) throw invalid(errors);

    await this.upsertMany(
      req.valid.body.fields.map(({ field_id, state }) => ({ field_id, state, asset_version_id: req.version.id })),
      ['field_id', 'asset_version_id'],
    );
    res.json(await this.forVersion(req.version.id));
  };
}

export const assetVersionFields = new AssetVersionFieldsMiddleware();
