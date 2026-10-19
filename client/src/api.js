export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const fileUrl = (path) => `${API_URL}${path}`;

export class ApiError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(fileUrl(path), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new ApiError(data?.error ?? `Request failed (${res.status})`, data?.errors);
  return data;
}

const versionPath = (assetId, versionId) => `/api/v1/asset/${assetId}/version/${versionId}`;

export const api = {
  corporateLocations: () => request('/api/v1/corporate/locations'),
  localLocations: () => request('/api/v1/local/locations'),
  assets: () => request('/api/v1/assets'),
  logos: () => request('/api/v1/asset_files?type=logo'),
  version: (assetId, versionId) => request(versionPath(assetId, versionId)),
  fields: (assetId, versionId) => request(`${versionPath(assetId, versionId)}/fields`),
  template: (templateUrl) => request(templateUrl),
  values: (assetId, versionId, locationId) =>
    request(`${versionPath(assetId, versionId)}/location/${locationId}/values`),
  saveStates: (assetId, versionId, fields) =>
    request(`${versionPath(assetId, versionId)}/state`, { method: 'PUT', body: { fields } }),
  saveValues: (assetId, versionId, locationId, values) =>
    request(`${versionPath(assetId, versionId)}/location/${locationId}/values`, { method: 'POST', body: { values } }),
};
