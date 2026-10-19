import { fileUrl } from '../api';
import { STATES } from './states';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ESCAPES[char]);

export const isEmpty = (value) => value === null || value === undefined || String(value).trim() === '';

/** The raw value a field shows for the given context, according to its state. */
export const resolveValue = (field, ctx) => STATES[field.state]?.resolve(field, ctx);

function toHtml(field, value, ctx) {
  if (field.input_type === 'image') {
    const logo = ctx.logos.find((file) => file.id === Number(value));
    if (!logo) return '';
    const src = escapeHtml(fileUrl(encodeURI(logo.url)));
    return `<img src="${src}" alt="" style="display:block;max-width:100%;max-height:100%;object-fit:contain;">`;
  }
  if (field.input_type === 'date') return escapeHtml(formatDate(value));
  return escapeHtml(value).replace(/\n/g, '<br>');
}

// Date inputs give YYYY-MM-DD; formatting in UTC keeps the day from shifting by time zone.
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMAT.format(date);
}

const PLACEHOLDER_STYLE =
  'color:#dc2626;background:rgba(220,38,38,.08);outline:2px dashed #dc2626;outline-offset:-2px;border-radius:3px;';

/** Marks a required field that has no value so it stands out in the preview. */
function placeholder(field) {
  const label = escapeHtml(field.name);
  if (field.input_type === 'image') {
    return `<div style="${PLACEHOLDER_STYLE}width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:600 14px sans-serif;">${label}</div>`;
  }
  return `<span style="${PLACEHOLDER_STYLE}padding:0 .2em;">${label}</span>`;
}

/**
 * Fills every {tag} in the template. An empty optional field also drops the <br> before it,
 * so a missing phone number does not leave a blank line.
 */
export function renderTemplate(html, fields, ctx) {
  const byTag = Object.fromEntries(fields.map((field) => [field.tag, field]));
  // One pass over the template, so text inserted for one tag is never scanned for other tags.
  return html.replace(/(<br\s*\/?>\s*)?\{([a-z_]+)\}/g, (match, br = '', tag) => {
    const field = byTag[tag];
    if (!field) return match;
    const value = resolveValue(field, ctx);
    const content = isEmpty(value) ? '' : toHtml(field, value, ctx);
    if (content) return br + content;
    return field.required ? br + placeholder(field) : '';
  });
}

export const hasBraces = (value) => typeof value === 'string' && /[{}]/.test(value);

// margin:auto centers the asset when it fits and still lets it scroll from the top-left when it does not.
const DOCUMENT_STYLE =
  'body{margin:0;min-height:100vh;display:flex;box-sizing:border-box;padding:24px;background:#f3f4f6}body>*{margin:auto;flex-shrink:0;outline:1px solid #ddd}';

export const toDocument = (body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${DOCUMENT_STYLE}</style></head><body>${body}</body></html>`;
