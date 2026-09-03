import { useState } from 'react';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

import { apiFetch } from '../lib/api.js';

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCheckIn(e) {
    e.preventDefault();

    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
      setStatus('error');
      setMessage('Enter the 6-digit check-in code.');
      return;
    }

    try {
      setLoading(true);
      setStatus(null);
      setMessage('');

      const data = await apiFetch('/check-in/check-in', {
        method: 'POST',
        body: JSON.stringify({
          code: trimmedCode,
        }),
      });

      setStatus(data.attendance?.status === 'late' ? 'late' : 'success');

      setMessage(
        data.message ||
          (data.attendance?.status === 'late'
            ? 'You were checked in late.'
            : 'You have been marked present.'),
      );

      setCode('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Unable to check in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='mx-auto flex max-w-md flex-col gap-4'>
      <div>
        <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
          Service Check-In
        </h1>

        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
          Mark your attendance for the current service.
        </p>
      </div>

      <Card>
        <p className='mb-4 text-sm text-zinc-500 dark:text-zinc-400'>
          Enter the 6-digit code shown at the entrance, or scan the QR code
          provided at the venue.
        </p>

        <form onSubmit={handleCheckIn} className='flex flex-col gap-3'>
          <input
            type='text'
            inputMode='numeric'
            autoComplete='one-time-code'
            maxLength={6}
            placeholder='000000'
            value={code}
            disabled={loading}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setCode(value);
              setStatus(null);
              setMessage('');
            }}
            className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-zinc-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
          />

          <Button type='submit' disabled={loading || code.length !== 6}>
            {loading ? 'Checking in...' : 'Check in'}
          </Button>
        </form>

        {status === 'success' && (
          <div className='mt-4 flex items-center gap-2'>
            <Badge tone='good'>Checked in</Badge>

            <span className='text-sm text-zinc-500 dark:text-zinc-400'>
              {message}
            </span>
          </div>
        )}

        {status === 'late' && (
          <div className='mt-4 flex items-center gap-2'>
            <Badge tone='warning'>Checked in late</Badge>

            <span className='text-sm text-zinc-500 dark:text-zinc-400'>
              {message}
            </span>
          </div>
        )}

        {status === 'error' && (
          <div className='mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400'>
            {message}
          </div>
        )}
      </Card>
    </div>
  );
}
