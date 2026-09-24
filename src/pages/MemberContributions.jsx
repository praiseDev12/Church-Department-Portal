import { useEffect, useState } from 'react';
import { CircleDollarSign, CalendarDays, Receipt } from 'lucide-react';

import { getMyContributions } from '../services/contributionService.js';

export default function MemberContributions() {
  const [contributions, setContributions] = useState({
    entries: [],
    totalAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My Contributions';

    let mounted = true;

    async function loadContributions() {
      try {
        setLoading(true);
        setError('');

        const data = await getMyContributions();

        if (!mounted) return;

        setContributions({
          entries: Array.isArray(data?.entries) ? data.entries : [],
          totalAmount: Number(data?.totalAmount || 0),
        });
      } catch (err) {
        if (!mounted) return;

        console.error('MemberContributions error:', err);
        setError(err.message || 'Failed to load your contributions');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadContributions();

    return () => {
      mounted = false;
    };
  }, []);

  const formatAmount = (amount) =>
    `₦${Number(amount || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      <div>
        <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
          My Contributions
        </h1>

        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
          View your contribution records and giving history.
        </p>
      </div>

      {error && (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'>
          {error}
        </div>
      )}

      <section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Total Contributed
              </p>

              <p className='mt-2 wrap-break-words font-display text-3xl font-semibold text-zinc-900 dark:text-white'>
                {loading ? '...' : formatAmount(contributions.totalAmount)}
              </p>
            </div>

            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <CircleDollarSign
                size={21}
                className='text-zinc-700 dark:text-zinc-300'
              />
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Contribution Records
              </p>

              <p className='mt-2 font-display text-3xl font-semibold text-zinc-900 dark:text-white'>
                {loading ? '...' : contributions.entries.length}
              </p>
            </div>

            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <Receipt size={21} className='text-zinc-700 dark:text-zinc-300' />
            </div>
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='border-b border-zinc-200 p-5 dark:border-zinc-800'>
          <h2 className='font-display text-lg font-semibold text-zinc-900 dark:text-white'>
            Contribution History
          </h2>
        </div>

        {loading ? (
          <div className='p-6 text-sm text-zinc-500 dark:text-zinc-400'>
            Loading your contributions...
          </div>
        ) : contributions.entries.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-6 py-12 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <Receipt size={22} className='text-zinc-500 dark:text-zinc-400' />
            </div>

            <h3 className='mt-4 font-medium text-zinc-900 dark:text-white'>
              No contributions yet
            </h3>

            <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
              Your contribution records will appear here once they are added.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-zinc-200 dark:divide-zinc-800'>
            {contributions.entries.map((entry) => (
              <div
                key={entry._id}
                className='flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='min-w-0'>
                  <p className='font-medium text-zinc-900 dark:text-white'>
                    {entry.contribution?.title || 'Contribution'}
                  </p>

                  <div className='mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400'>
                    <CalendarDays size={15} />
                    {formatDate(entry.contributedAt)}
                  </div>
                </div>

                <p className='font-display text-lg font-semibold text-zinc-900 dark:text-white'>
                  {formatAmount(entry.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
