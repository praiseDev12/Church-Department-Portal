import { apiFetch } from '../lib/api.js';

export function makeUnitHead(memberId) {
  return apiFetch(`/roles/${memberId}/make-unit-head`, { method: 'PATCH' });
}

export function removeUnitHead(memberId) {
  return apiFetch(`/roles/${memberId}/remove-unit-head`, { method: 'PATCH' });
}

export function makeMainAdmin(memberId) {
  return apiFetch(`/roles/${memberId}/make-main-admin`, { method: 'PATCH' });
}

export function removeMainAdmin(memberId) {
  return apiFetch(`/roles/${memberId}/remove-main-admin`, { method: 'PATCH' });
}
