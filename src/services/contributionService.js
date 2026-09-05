import { apiFetch } from '../lib/api.js';

export async function getContributions() {
  return apiFetch('/contributions');
}

export async function getContribution(contributionId) {
  return apiFetch(`/contributions/${contributionId}`);
}

export async function createContribution(title) {
  return apiFetch('/contributions', {
    method: 'POST',
    body: JSON.stringify({
      title,
    }),
  });
}

export async function addContributionEntry(
  contributionId,
  { memberId, amount, contributedAt },
) {
  return apiFetch(`/contributions/${contributionId}/entries`, {
    method: 'POST',
    body: JSON.stringify({
      memberId,
      amount,
      contributedAt,
    }),
  });
}

export async function updateContributionEntry(
  contributionId,
  entryId,
  { memberId, amount, contributedAt },
) {
  return apiFetch(`/contributions/${contributionId}/entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      memberId,
      amount,
      contributedAt,
    }),
  });
}

export async function deleteContributionEntry(contributionId, entryId) {
  return apiFetch(`/contributions/${contributionId}/entries/${entryId}`, {
    method: 'DELETE',
  });
}

export async function updateContribution(contributionId, title) {
  return apiFetch(`/contributions/${contributionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title,
    }),
  });
}

export async function deleteContribution(contributionId) {
  return apiFetch(`/contributions/${contributionId}`, {
    method: 'DELETE',
  });
}
