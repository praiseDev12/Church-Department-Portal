import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UpdateAppPrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    if (!window.__updatePWA) {
      window.location.reload();
      return;
    }

    setUpdating(true);

    try {
      await window.__updatePWA(true);
    } catch {
      setUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className='fixed bottom-4 left-1/2 z-9999 w-[calc(100%-2rem)] max-w-md -translate-x-1/2'>
      <div className='flex items-start gap-3 rounded-2xl border border-brand-200 bg-white p-4 shadow-xl dark:border-brand-800 dark:bg-zinc-900'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-900/30 dark:text-brand-200'>
          <RefreshCw className={`size-5 ${updating ? 'animate-spin' : ''}`} />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='font-semibold text-zinc-900 dark:text-white'>
            New version available
          </p>

          <p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
            A new version of the Department Portal is ready.
          </p>

          <div className='mt-3 flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={handleUpdate}
              disabled={updating}
              className='rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {updating ? 'Updating...' : 'Update now'}
            </button>

            <button
              type='button'
              onClick={handleDismiss}
              disabled={updating}
              className='rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-800'
            >
              Later
            </button>
          </div>
        </div>

        <button
          type='button'
          onClick={handleDismiss}
          disabled={updating}
          className='shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
          aria-label='Dismiss update notification'
        >
          <X className='size-4' />
        </button>
      </div>
    </div>
  );
}
