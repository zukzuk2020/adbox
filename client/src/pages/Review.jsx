import { Button, Label, Select, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import CenteredSpinner from '../components/CenteredSpinner';
import FieldRow from '../components/FieldRow';
import PageLayout from '../components/PageLayout';
import SplitPane from '../components/SplitPane';
import { usePageLocation } from '../hooks/usePageLocation';
import { hasBraces, isEmpty, renderTemplate, resolveValue, toDocument } from '../render/renderTemplate';
import { isEditable, STATES } from '../render/states';
import { fetchAssets, fetchLogos } from '../store/catalogSlice';
import { fetchLocalLocations } from '../store/locationsSlice';
import {
  draftKey,
  loadValues,
  loadVersion,
  saveCorporate,
  saveLocationValues,
  setDraftState,
  setDraftValue,
  valuesKey,
} from '../store/reviewSlice';

export default function Review({ mode }) {
  const params = useParams();
  const locationId = Number(params.locationId);
  const assetId = Number(params.assetId);
  const dispatch = useDispatch();
  const { title } = usePageLocation(mode, locationId);
  const childLocations = useSelector((state) => state.locations.local);
  const { assets, logos } = useSelector((state) => state.catalog);
  const review = useSelector((state) => state.review);

  const [previewChoice, setPreviewChoice] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const notify = (color, message) => setNotice((prev) => ({ color, message, id: (prev?.id ?? 0) + 1 }));

  const asset = assets.find((a) => a.id === assetId);
  const versionId = asset?.version_id;
  const corporateId =
    mode === 'corporate' ? locationId : childLocations.find((l) => l.id === locationId)?.parent_id;
  const previewOptions = childLocations.filter((l) => l.parent_id === corporateId);
  const previewId = mode === 'corporate' ? (previewChoice ?? previewOptions[0]?.id) : locationId;
  const previewLocation = childLocations.find((l) => l.id === previewId);

  useEffect(() => {
    dispatch(fetchAssets());
    dispatch(fetchLogos());
    if (mode === 'corporate') dispatch(fetchLocalLocations());
  }, [dispatch, mode]);

  useEffect(() => {
    if (!versionId) return;
    dispatch(loadVersion({ assetId, versionId }))
      .unwrap()
      .catch((error) => {
        setLoadFailed(true);
        setNotice((prev) => ({ color: 'failure', message: error.message, id: (prev?.id ?? 0) + 1 }));
      });
  }, [dispatch, assetId, versionId]);

  useEffect(() => {
    if (versionId && corporateId) dispatch(loadValues({ assetId, versionId, locationId: corporateId }));
  }, [dispatch, assetId, versionId, corporateId]);

  useEffect(() => {
    if (versionId && previewId) dispatch(loadValues({ assetId, versionId, locationId: previewId }));
  }, [dispatch, assetId, versionId, previewId]);

  const draftStates = review.draftStates[versionId] ?? {};
  const fields = (review.fields[versionId] ?? []).map((f) => ({ ...f, state: draftStates[f.field_id] ?? f.state }));
  const template = review.templates[versionId];

  // Saved and draft values for a state are stored under the location that owns that state.
  const ownerIds = { corporate: corporateId, location: previewId };
  const sourceFor = (state) => {
    const ownerId = ownerIds[STATES[state].owner];
    return { saved: valuesKey(versionId, ownerId), draft: draftKey(versionId, ownerId, state) };
  };
  const values = Object.fromEntries(
    Object.keys(STATES)
      .filter((state) => STATES[state].owner)
      .map((state) => {
        const { saved, draft } = sourceFor(state);
        return [state, { ...review.values[saved], ...review.draftValues[draft] }];
      }),
  );
  const ctx = { location: previewLocation, values, logos };
  const srcDoc = template && previewLocation ? toDocument(renderTemplate(template, fields, ctx)) : '';
  const editableFields = fields.filter((f) => isEditable(f.state, mode));
  const showErrors = (nextErrors) => {
    setErrors(nextErrors);
    const first = fields.find((f) => nextErrors[f.field_id]);
    if (!first) return;
    document.getElementById(`field-row-${first.field_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById(`field-${first.field_id}`)?.focus({ preventScroll: true });
  };

  const changeValue = (field, value) => {
    setErrors((current) => ({ ...current, [field.field_id]: undefined }));
    dispatch(setDraftValue({ key: sourceFor(field.state).draft, fieldId: field.field_id, value }));
  };

  const changeState = (field, state) => {
    setErrors((current) => ({ ...current, [field.field_id]: undefined }));
    dispatch(setDraftState({ versionId, fieldId: field.field_id, value: state }));
  };

  async function save() {
    const nextErrors = {};
    const payload = editableFields.map((field) => {
      const value = resolveValue(field, ctx) ?? (field.input_type === 'image' ? null : '');
      if (field.required && isEmpty(value)) nextErrors[field.field_id] = `${field.name} is required`;
      else if (hasBraces(value)) nextErrors[field.field_id] = `${field.name} cannot contain { or } characters`;
      return { field_id: field.field_id, value };
    });
    showErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify('failure', 'Please fix the highlighted fields.');
      return;
    }

    const draftKeys = [...new Set(editableFields.map((f) => sourceFor(f.state).draft))];
    setSaving(true);
    try {
      if (mode === 'corporate') {
        const states = fields.map(({ field_id, state }) => ({ field_id, state }));
        await dispatch(
          saveCorporate({ assetId, versionId, locationId: corporateId, states, values: payload, draftKeys }),
        ).unwrap();
      } else {
        await dispatch(saveLocationValues({ assetId, versionId, locationId, values: payload, draftKeys })).unwrap();
      }
      notify('success', 'Changes saved.');
    } catch (error) {
      const fieldErrors = (error.errors ?? []).filter((e) => e.field_id).map((e) => [e.field_id, e.message]);
      showErrors(Object.fromEntries(fieldErrors));
      notify('failure', error.message);
    } finally {
      setSaving(false);
    }
  }

  const ready = template && fields.length && previewLocation;

  const fieldsPane = (
    <div className="space-y-3 p-6">
      {mode === 'local' && !editableFields.length && (
        <p className="text-sm text-gray-500">Corporate has set every field for this asset. Nothing to fill in.</p>
      )}
      {fields.map((field) => (
        <FieldRow
          key={field.field_id}
          field={field}
          value={resolveValue(field, ctx)}
          mode={mode}
          logos={logos}
          error={errors[field.field_id]}
          onValueChange={(value) => changeValue(field, value)}
          onStateChange={(state) => changeState(field, state)}
        />
      ))}
      <Button onClick={save} disabled={saving || (mode === 'local' && !editableFields.length)} className="w-full cursor-pointer disabled:cursor-not-allowed">
        {saving && <Spinner size="sm" light className="me-2" aria-label="Saving" />}
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );

  const previewPane = (
    <div className="flex h-full flex-col bg-gray-100">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        {mode === 'corporate' ? (
          <>
            <Label htmlFor="preview-location">Preview as</Label>
            <Select
              id="preview-location"
              sizing="sm"
              value={previewId ?? ''}
              onChange={(event) => setPreviewChoice(Number(event.target.value))}
            >
              {previewOptions.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.location_alias})
                </option>
              ))}
            </Select>
          </>
        ) : (
          <span className="text-sm font-medium text-gray-700">Live preview</span>
        )}
      </div>
      <iframe title="Asset preview" sandbox="" srcDoc={srcDoc} className="min-h-0 w-full flex-1 bg-white" />
    </div>
  );

  const crumbs = [
    { label: title || 'Location', to: `/${mode}` },
    { label: 'Assets', to: `/${mode}/${locationId}/assets` },
    { label: asset?.name ?? 'Asset' },
  ];

  return (
    <PageLayout fill title={title} subtitle={asset?.name} crumbs={crumbs} notice={notice}>
      {ready ? (
        <SplitPane left={fieldsPane} right={previewPane} />
      ) : loadFailed ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          This asset could not be loaded.
        </div>
      ) : (
        <CenteredSpinner label="Loading asset" />
      )}
    </PageLayout>
  );
}
