// Rebuilds every file under db/data/json from db/data/input and db/assets.
import fs from 'node:fs/promises';
import path from 'node:path';
import { ASSETS_DIR, DATA_DIR, INPUT_DIR } from '../src/config.js';

const CAMPAIGN = { id: 1, name: 'Harbor Point Bank' };

const CORPORATE_LOCATION = {
  name: 'Harbor Point Bank - Corporate',
  location_alias: 'CORP-000',
  parent_id: null,
  address: '100 Harbor Point Plaza, Grand Rapids, MI 49503',
  phone: '(616) 555-0100',
  manager: 'Corporate Marketing',
  logo_id: null,
};

const ASSETS = [
  { template: 'asset_fall_rate_promo.html', name: 'Fall Rate Promo', type: 'web' },
  { template: 'asset_branch_open_house.html', name: 'Branch Open House', type: 'print' },
];

// Fields whose tag is not listed here become required text fields with no database mapping.
const KNOWN_FIELDS = {
  logo: { name: 'Logo', input_type: 'image', db_relation: 'locations.logo_id' },
  location_name: { name: 'Location name', input_type: 'text', db_relation: 'locations.name' },
  address: { name: 'Address', input_type: 'text', db_relation: 'locations.address' },
  phone: { name: 'Phone', input_type: 'text', db_relation: 'locations.phone', required: false },
  manager_name: { name: 'Manager name', input_type: 'text', db_relation: 'locations.manager' },
  deal: { name: 'Deal', input_type: 'textarea', db_relation: null },
  event_date: { name: 'Event date', input_type: 'date', db_relation: null },
};

// Suggested default states from the brief's README.
const DEFAULT_STATES = {
  logo: 'db',
  location_name: 'db',
  address: 'db',
  phone: 'db',
  manager_name: 'db',
  deal: 'location',
  event_date: 'location',
  disclaimer: 'locked',
};

const LOCKED_VALUES = { disclaimer: 'Member FDIC. Rates subject to change.' };

const humanize = (tag) => tag.charAt(0).toUpperCase() + tag.slice(1).replaceAll('_', ' ');

const allowedStates = ({ input_type, db_relation }) => {
  if (input_type === 'image') return db_relation ? ['db', 'locked'] : ['locked'];
  return db_relation ? ['db', 'location', 'locked'] : ['location', 'locked'];
};

const templateTags = (html) => [...new Set([...html.matchAll(/\{([a-z_]+)\}/g)].map((m) => m[1]))];

const withIds = (rows) => rows.map((row, index) => ({ id: index + 1, ...row }));

async function main() {
  const input = JSON.parse(await fs.readFile(path.join(INPUT_DIR, 'locations.json'), 'utf8'));
  const imageNames = (await fs.readdir(path.join(ASSETS_DIR, 'images'))).filter((f) => f.endsWith('.png')).sort();

  const assetFiles = withIds([
    ...imageNames.map((file) => ({ type: 'logo', name: path.parse(file).name, file_path: `images/${file}` })),
    ...ASSETS.map((a) => ({ type: 'template', name: a.name, file_path: `templates/${a.template}` })),
  ]);
  const fileByPath = (filePath) => assetFiles.find((f) => f.file_path === filePath);

  const corporate = { id: 1, ...CORPORATE_LOCATION };
  const children = input.locations.map((loc, index) => ({
    id: index + 2,
    name: loc.location_name,
    location_alias: loc.location_id,
    parent_id: corporate.id,
    address: loc.address,
    phone: loc.phone,
    manager: loc.manager_name,
    logo_id: fileByPath(`images/${path.basename(loc.logo_file)}`)?.id ?? null,
  }));

  const templates = await Promise.all(
    ASSETS.map(async (a) => ({
      ...a,
      tags: templateTags(await fs.readFile(path.join(ASSETS_DIR, 'templates', a.template), 'utf8')),
    })),
  );

  const uniqueTags = [...new Set(templates.flatMap((t) => t.tags))];
  const assetFields = withIds(
    uniqueTags.map((tag) => {
      const known = KNOWN_FIELDS[tag] ?? { name: humanize(tag), input_type: 'text', db_relation: null };
      const field = { name: known.name, input_type: known.input_type, tag, db_relation: known.db_relation };
      return { ...field, required: known.required ?? true, allowed_states: allowedStates(field) };
    }),
  );
  const fieldByTag = (tag) => assetFields.find((f) => f.tag === tag);

  const assets = templates.map((t, index) => ({
    id: index + 1,
    campaign_id: CAMPAIGN.id,
    version_id: index + 1,
    name: t.name,
    type: t.type,
  }));

  const assetVersions = templates.map((t, index) => ({
    id: index + 1,
    asset_id: assets[index].id,
    template_id: fileByPath(`templates/${t.template}`).id,
    version: 1,
    name: `${t.name} v1`,
  }));

  const assetVersionFields = withIds(
    templates.flatMap((t, index) =>
      t.tags.map((tag) => {
        const field = fieldByTag(tag);
        return {
          field_id: field.id,
          state: DEFAULT_STATES[tag] ?? (field.db_relation ? 'db' : 'location'),
          asset_version_id: assetVersions[index].id,
        };
      }),
    ),
  );

  const lockedValues = withIds(
    assetVersions.flatMap((version, index) =>
      Object.entries(LOCKED_VALUES)
        .filter(([tag]) => templates[index].tags.includes(tag))
        .map(([tag, value]) => ({
          field_id: fieldByTag(tag).id,
          location_id: corporate.id,
          version_id: version.id,
          value,
        })),
    ),
  );

  const files = {
    'campaign.json': [CAMPAIGN],
    'locations.json': [corporate, ...children],
    'asset_files.json': assetFiles,
    'asset_fields.json': assetFields,
    'assets.json': assets,
    'asset_versions.json': assetVersions,
    'asset_version_fields.json': assetVersionFields,
    'asset_location_field_values.json': lockedValues,
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const [name, rows] of Object.entries(files)) {
    await fs.writeFile(path.join(DATA_DIR, name), `${JSON.stringify(rows, null, 2)}\n`);
  }
  console.log(`Seeded ${Object.keys(files).length} files into ${DATA_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
