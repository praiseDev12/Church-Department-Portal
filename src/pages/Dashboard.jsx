import { useEffect, useState } from 'react';
import Card from '../components/ui/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';

import { ArrowRight } from 'lucide-react';

const statConfig = [
  { key: 'totalMembers', label: 'Total members' },
  { key: 'presentLastService', label: 'Present last service' },
  { key: 'lateLastService', label: 'Late last service' },
  { key: 'absentLastService', label: 'Absent last service' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch('/dashboard/summary')
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.message || 'Could not load dashboard data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='flex flex-col gap-6 dark:text-white'>
      <div>
        <h1 className='font-display text-2xl font-semibold'>
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          Here's what's happening in your{' '}
          {user?.role === 'main_admin' ? 'department' : 'unit'}.
        </p>
      </div>

      {error && (
        <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
      )}

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {statConfig.map((stat) => {
          const value = summary?.[stat.key];

          return (
            <Card key={stat.key}>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                {stat.label}
              </p>
              <p className='mt-2 font-display text-3xl font-semibold text-brand-500 dark:text-brand-300'>
                {loading ? '…' : (value ?? 0)}
              </p>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Latest service
            </p>

            <p className='mt-1 font-display text-lg font-semibold'>
              {loading
                ? 'Loading...'
                : summary?.lastServiceName || 'No service recorded yet'}
            </p>

            {!loading && summary?.lastServiceDate && (
              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                {new Date(summary.lastServiceDate).toLocaleDateString('en-NG', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          {!loading && summary?.lastServiceName && (
            <a
              href='/attendance'
              className='inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
            >
              View attendance
              <ArrowRight size={15} />
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
