// Corporate (no parent) writes locked values; child locations write location input values.
export const editableState = (location) => (location.parent_id === null ? 'locked' : 'location');
