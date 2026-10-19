import { HelperText, Label, Select, Textarea, TextInput } from 'flowbite-react';
import { fileUrl } from '../api';
import { isEditable, STATES } from '../render/states';
import LockIcon from './LockIcon';

function LogoThumb({ logo }) {
  return (
    <div className="flex h-16 w-44 items-center justify-center rounded-md border border-gray-200 bg-white p-1">
      {logo ? (
        <img src={fileUrl(logo.url)} alt={logo.name} className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-xs text-gray-400">No logo</span>
      )}
    </div>
  );
}

function FieldInput({ id, field, value, editable, logos, onChange }) {
  if (field.input_type === 'image') {
    const logo = logos.find((file) => file.id === Number(value));
    if (!editable) return <LogoThumb logo={logo} />;
    return (
      <Select
        id={id}
        value={logo?.id ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
      >
        <option value="">Choose a logo…</option>
        {logos.map((file) => (
          <option key={file.id} value={file.id}>
            {file.name}
          </option>
        ))}
      </Select>
    );
  }

  const props = {
    id,
    value: value ?? '',
    disabled: !editable,
    placeholder: editable ? `Enter ${field.name.toLowerCase()}` : '',
    onChange: (event) => onChange(event.target.value),
  };
  if (field.input_type === 'textarea') return <Textarea rows={3} {...props} />;
  return <TextInput type={field.input_type === 'date' ? 'date' : 'text'} {...props} />;
}

export default function FieldRow({ field, value, mode, logos, error, onValueChange, onStateChange }) {
  const editable = isEditable(field.state, mode);
  const inputId = `field-${field.field_id}`;
  const help = error ?? (mode === 'corporate' ? STATES[field.state]?.hint : null);

  return (
    <div
      id={`field-row-${field.field_id}`}
      className={`rounded-lg border bg-white p-4 ${editable ? 'border-blue-300 shadow-sm' : 'border-gray-200'}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label htmlFor={inputId} className="flex items-center gap-1.5">
          {field.name}
          {editable && field.required && <span className="text-red-600">*</span>}
          {!editable && (
            <span className="text-gray-400" title="Read only">
              <LockIcon />
            </span>
          )}
        </Label>
        {mode === 'corporate' && (
          <Select
            sizing="sm"
            className="w-40 shrink-0"
            aria-label={`${field.name} state`}
            value={field.state}
            onChange={(event) => onStateChange(event.target.value)}
          >
            {field.allowed_states.map((allowed) => (
              <option key={allowed} value={allowed}>
                {STATES[allowed]?.label ?? allowed}
              </option>
            ))}
          </Select>
        )}
      </div>
      <FieldInput id={inputId} field={field} value={value} editable={editable} logos={logos} onChange={onValueChange} />
      {help && (
        <HelperText color={error ? 'failure' : 'gray'} className="mt-1 text-xs">
          {help}
        </HelperText>
      )}
    </div>
  );
}
