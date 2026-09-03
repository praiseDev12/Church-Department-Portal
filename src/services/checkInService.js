import { apiFetch } from '../lib/api.js';

export function submitCheckIn(code) {
  return apiFetch('/check-in', {
    method: 'POST',
    body: JSON.stringify({
      code,
    }),
  });
}

export function getServices() {
  return apiFetch('/check-in/services');
}

export function createService(data) {
  return apiFetch('/check-in/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateService(serviceId, data) {
  return apiFetch(`/check-in/services/${serviceId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteService(serviceId) {
  return apiFetch(`/check-in/services/${serviceId}`, {
    method: 'DELETE',
  });
}

export function generateCheckInCode(serviceId) {
  return apiFetch(`/check-in/services/${serviceId}/generate-code`, {
    method: 'POST',
  });
}

export function getTodaySessions() {
  return apiFetch('/check-in/sessions/today');
}

export function getSessionAttendance(sessionId) {
  return apiFetch(`/check-in/sessions/${sessionId}/attendance`);
}

export function getMyAttendance() {
  return apiFetch('/check-in/my-attendance');
}
