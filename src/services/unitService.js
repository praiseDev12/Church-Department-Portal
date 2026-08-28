import { apiFetch } from '../lib/api.js';

export function getUnits() {
  return apiFetch('/units');
}

export function createUnit(name) {
  return apiFetch('/units', {
    method: 'POST',
    body: JSON.stringify({
      name,
    }),
  });
}

export function updateUnit(unitId, name) {
  return apiFetch(`/units/${unitId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name,
    }),
  });
}

export function deleteUnit(unitId, setupCode) {
  return apiFetch(`/units/${unitId}`, {
    method: 'DELETE',
    body: JSON.stringify({
      setupCode,
    }),
  });
}
