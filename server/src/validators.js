import * as yup from 'yup';

const id = yup.number().integer().positive().required();

export const assetParams = yup.object({ assetId: id });

export const versionParams = yup.object({ assetId: id, versionId: id });

export const valuesParams = yup.object({ assetId: id, versionId: id, locationId: id });

export const assetFilesQuery = yup.object({ type: yup.string().oneOf(['logo', 'template']) });

export const statesBody = yup.object({
  fields: yup
    .array()
    .of(yup.object({ field_id: id, state: yup.string().required() }))
    .min(1)
    .required(),
});

// Braces delimit template tags, so a value containing them could inject a tag into the asset.
const noBraces = (value) => typeof value !== 'string' || !/[{}]/.test(value);

export const valuesBody = yup.object({
  values: yup
    .array()
    .of(
      yup.object({
        field_id: id,
        value: yup
          .mixed()
          .nullable()
          .defined()
          .test('no-braces', function check(value) {
            if (noBraces(value)) return true;
            const params = { field_id: this.parent.field_id };
            return this.createError({ message: 'Value cannot contain { or } characters', params });
          }),
      }),
    )
    .min(1)
    .required(),
});

/** Validates the given request parts and exposes the cast results on req.valid. */
export const validate = (schemas) => async (req, res, next) => {
  req.valid = {};
  for (const [part, schema] of Object.entries(schemas)) {
    req.valid[part] = await schema.validate(req[part] ?? {}, { abortEarly: false, stripUnknown: true });
  }
  next();
};
