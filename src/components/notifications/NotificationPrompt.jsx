import { useState } from 'react';

import { Bell, X } from 'lucide-react';

import { requestNotificationPermission } from '../../lib/messaging.js';

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem('notification-prompt-dismissed') !== 'true';
  });

  const [loading, setLoading] = useState(false);

  async function handleEnable() {
    setLoading(true);

    try {
      const token = await requestNotificationPermission();

      if (token) {
        localStorage.setItem('notification-prompt-dismissed', 'true');

        setVisible(false);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem('notification-prompt-dismissed', 'true');

    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className='fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900'>
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'>
          <Bell className='h-5 w-5' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <h3 className='font-semibold text-zinc-900 dark:text-white'>
                Stay updated
              </h3>

              <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
                Get notifications about church announcements, services, and
                important updates.
              </p>
            </div>

            <button
              type='button'
              onClick={handleDismiss}
              aria-label='Dismiss notification prompt'
              className='rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='mt-4 flex gap-2'>
            <button
              type='button'
              onClick={handleEnable}
              disabled={loading}
              className='rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading ? 'Enabling…' : 'Enable notifications'}
            </button>

            <button
              type='button'
              onClick={handleDismiss}
              className='rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
