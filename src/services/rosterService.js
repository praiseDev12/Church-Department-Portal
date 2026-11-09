import { apiFetch } from '../lib/api.js';

export async function createRosterTemplate({
  name,
  description,
  duties,
  settings,
}) {
  return apiFetch('/roster/templates', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      duties,
      settings,
    }),
  });
}

export async function generateMonthlyRoster(templateId, month) {
  return apiFetch('/roster/generate', {
    method: 'POST',
    body: JSON.stringify({
      templateId,
      month,
    }),
  });
}

export async function getMonthlyRoster(rosterId) {
  return apiFetch(`/roster/${rosterId}`);
}

export async function publishMonthlyRoster(rosterId) {
  return apiFetch(`/roster/${rosterId}/publish`, {
    method: 'PATCH',
  });
}

export async function addRosterAssignment(
  rosterId,
  occurrenceId,
  { memberId, roleId = null, roleName = '' },
) {
  return apiFetch(
    `/roster/${rosterId}/occurrences/${occurrenceId}/assignments`,
    {
      method: 'POST',
      body: JSON.stringify({
        memberId,
        roleId,
        roleName,
      }),
    },
  );
}

export async function updateRosterAssignment(
  rosterId,
  occurrenceId,
  assignmentId,
  { memberId, roleId = null, roleName = '' },
) {
  return apiFetch(
    `/roster/${rosterId}/occurrences/${occurrenceId}/assignments/${assignmentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        memberId,
        roleId,
        roleName,
      }),
    },
  );
}

export async function removeRosterAssignment(
  rosterId,
  occurrenceId,
  assignmentId,
) {
  return apiFetch(
    `/roster/${rosterId}/occurrences/${occurrenceId}/assignments/${assignmentId}`,
    {
      method: 'DELETE',
    },
  );
}

export async function createRosterEvent({
  templateId,
  name,
  description,
  startDate,
  endDate,
  startTime,
  endTime,
  location,
  membersNeeded,
  rolesEnabled,
  roles,
}) {
  return apiFetch('/roster/events', {
    method: 'POST',
    body: JSON.stringify({
      templateId,
      name,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      membersNeeded,
      rolesEnabled,
      roles,
    }),
  });
}

export async function getRosterTemplates() {
  return apiFetch('/roster/templates');
}

export async function updateRosterTemplate(
  templateId,
  { name, description, duties, settings },
) {
  return apiFetch(`/roster/templates/${templateId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name,
      description,
      duties,
      settings,
    }),
  });
}

export async function getRosterEvents(templateId) {
  return apiFetch(`/roster/events/template/${templateId}`);
}

export async function updateRosterEvent(
  eventId,
  {
    name,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    location,
    membersNeeded,
    rolesEnabled,
    roles,
  },
) {
  return apiFetch(`/roster/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      membersNeeded,
      rolesEnabled,
      roles,
    }),
  });
}

export async function deactivateRosterEvent(eventId) {
  return apiFetch(`/roster/events/${eventId}/deactivate`, {
    method: 'PATCH',
  });
}

export async function getMonthlyRosterByTemplateMonth(templateId, month) {
  return apiFetch(`/roster/template/${templateId}/month/${month}`);
}

export async function deleteDraftRoster(rosterId) {
  return apiFetch(`/roster/${rosterId}`, {
    method: 'DELETE',
  });
}

export async function deleteRosterTemplate(templateId) {
  return apiFetch(`/roster/templates/${templateId}`, {
    method: 'DELETE',
  });
}

export async function getPublishedRosters() {
  return apiFetch('/roster/published');
}

export async function resetRosterData() {
  return apiFetch('/roster/reset', {
    method: 'DELETE',
  });
}
