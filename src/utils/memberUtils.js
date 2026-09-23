export function formatWhatsAppNumber(number) {
  if (!number) return '';

  const cleaned = number.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    return `234${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith('234')) {
    return cleaned;
  }

  return cleaned;
}

export function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatEnum(value) {
  if (!value) return '—';

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
