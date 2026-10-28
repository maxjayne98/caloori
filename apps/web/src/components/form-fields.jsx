'use client';
import { Select } from '@nourish/ui';

export function field(label, name, value, type = 'number', options = {}) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        defaultValue={value ?? ''}
        type={type}
        required={true}
        min={options.min ?? (type === 'number' ? 0 : undefined)}
        max={options.max}
        step={options.step ?? (type === 'number' ? 'any' : undefined)}
      />
    </div>
  );
}
export function formData(e) {
  e.preventDefault();
  return Object.fromEntries(new FormData(e.target));
}
export function select(label, name, opts, value) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <Select
        required
        name={name}
        id={name}
        defaultValue={value ?? ''}
        options={opts.map((option) =>
          typeof option === 'string'
            ? { value: option, label: option }
            : { value: option.value, label: option.label },
        )}
      />
    </div>
  );
}
