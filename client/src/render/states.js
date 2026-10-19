/**
 * Every field state lives here. `owner` says whose saved values a state reads (null for
 * location record data) and `editableOn` says which page may edit it.
 */
export const STATES = {
  db: {
    label: 'From database',
    hint: "Filled from the location's record",
    color: 'gray',
    owner: null,
    editableOn: null,
    resolve: (field, ctx) => ctx.location?.[field.db_relation?.split('.').pop()],
  },
  location: {
    label: 'Location input',
    hint: 'Typed in by each location',
    color: 'success',
    owner: 'location',
    editableOn: 'local',
    resolve: (field, ctx) => ctx.values.location?.[field.field_id],
  },
  locked: {
    label: 'Locked',
    hint: 'Set by corporate for every location',
    color: 'warning',
    owner: 'corporate',
    editableOn: 'corporate',
    resolve: (field, ctx) => ctx.values.locked?.[field.field_id],
  },
};

export const isEditable = (state, mode) => STATES[state]?.editableOn === mode;
