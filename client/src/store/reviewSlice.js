import { createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import { apiThunk } from './apiThunk';

export const valuesKey = (versionId, locationId) => `${versionId}:${locationId}`;
export const draftKey = (versionId, locationId, state) => `${versionId}:${locationId}:${state}`;

const toValueMap = (records) => Object.fromEntries(records.map((r) => [r.field_id, r.value]));

export const loadVersion = apiThunk('review/loadVersion', async ({ assetId, versionId }) => {
  const [version, fields] = await Promise.all([api.version(assetId, versionId), api.fields(assetId, versionId)]);
  const template = await api.template(version.template_url);
  return { version, fields, template };
});

export const loadValues = apiThunk('review/loadValues', async ({ assetId, versionId, locationId }) => ({
  versionId,
  locationId,
  records: await api.values(assetId, versionId, locationId),
}));

export const saveLocationValues = apiThunk(
  'review/saveLocationValues',
  async ({ assetId, versionId, locationId, values }) => ({
    versionId,
    locationId,
    records: await api.saveValues(assetId, versionId, locationId, values),
  }),
);

/** States are saved before values so a field just switched to locked accepts its value. */
export const saveCorporate = apiThunk(
  'review/saveCorporate',
  async ({ assetId, versionId, locationId, states, values }) => {
    const fields = await api.saveStates(assetId, versionId, states);
    const records = values.length ? await api.saveValues(assetId, versionId, locationId, values) : null;
    return { versionId, locationId, fields, records };
  },
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    versions: {},
    templates: {},
    fields: {},
    values: {},
    draftStates: {},
    draftValues: {},
  },
  reducers: {
    setDraftState(state, { payload: { versionId, fieldId, value } }) {
      state.draftStates[versionId] = { ...state.draftStates[versionId], [fieldId]: value };
    },
    setDraftValue(state, { payload: { key, fieldId, value } }) {
      state.draftValues[key] = { ...state.draftValues[key], [fieldId]: value };
    },
  },
  extraReducers: (builder) => {
    const storeValues = (state, { versionId, locationId, records }) => {
      state.values[valuesKey(versionId, locationId)] = toValueMap(records);
    };
    const clearDrafts = (state, keys = []) => keys.forEach((key) => delete state.draftValues[key]);
    builder
      .addCase(loadVersion.fulfilled, (state, { payload: { version, fields, template } }) => {
        state.versions[version.id] = version;
        state.fields[version.id] = fields;
        state.templates[version.id] = template;
      })
      .addCase(loadValues.fulfilled, (state, { payload }) => storeValues(state, payload))
      .addCase(saveLocationValues.fulfilled, (state, { payload, meta }) => {
        storeValues(state, payload);
        clearDrafts(state, meta.arg.draftKeys);
      })
      .addCase(saveCorporate.fulfilled, (state, { payload, meta }) => {
        state.fields[payload.versionId] = payload.fields;
        delete state.draftStates[payload.versionId];
        if (payload.records) storeValues(state, payload);
        clearDrafts(state, meta.arg.draftKeys);
      });
  },
});

export const { setDraftState, setDraftValue } = reviewSlice.actions;

export default reviewSlice.reducer;
