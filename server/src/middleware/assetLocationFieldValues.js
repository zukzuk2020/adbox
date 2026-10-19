import { invalid } from '../errors.js';
import { editableState } from '../rules.js';
import { assetFiles } from './assetFiles.js';
import { assetVersionFields } from './assetVersionFields.js';
import { BaseMiddleware } from './BaseMiddleware.js';

async function valueError(field, value) {
  if (field.input_type === 'image') {
    if (value === null || value === '') return field.required ? `${field.name} is required` : null;
    const file = Number.isInteger(value) ? await assetFiles.findOne({ id: value, type: 'logo' }) : null;
    return file ? null : `${field.name} must be an existing logo`;
  }
  if (value !== null && typeof value !== 'string') return `${field.name} must be text`;
  if (field.required && !value?.trim()) return `${field.name} is required`;
  if (field.input_type === 'date' && value && Number.isNaN(Date.parse(value))) {
    return `${field.name} must be a valid date`;
  }
  return null;
}

class AssetLocationFieldValuesMiddleware extends BaseMiddleware {
  constructor() {
    super('asset_location_field_values.json');
  }

  #forLocation(req) {
    return this.where({ version_id: req.version.id, location_id: req.location.id });
  }

  list = async (req, res) => {
    res.json(await this.#forLocation(req));
  };

  /** Upserts only values whose field is currently in the state this location may edit. */
  save = async (req, res) => {
    const state = editableState(req.location);
    const fields = await assetVersionFields.forVersion(req.version.id);
    const errors = [];
    for (const { field_id, value } of req.valid.body.values) {
      const field = fields.find((f) => f.field_id === field_id);
      const message = !field
        ? 'Field is not part of this version'
        : field.state !== state
          ? `${field.name} is not editable here`
          : await valueError(field, value);
      if (message) errors.push({ field_id, message });
    }
    if (errors.length) throw invalid(errors);

    await this.upsertMany(
      req.valid.body.values.map(({ field_id, value }) => ({
        field_id,
        location_id: req.location.id,
        version_id: req.version.id,
        value: value ?? '',
      })),
      ['field_id', 'location_id', 'version_id'],
    );
    res.json(await this.#forLocation(req));
  };
}

export const assetLocationFieldValues = new AssetLocationFieldValuesMiddleware();
