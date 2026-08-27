import { useEffect, useState } from 'react';
import Card from '../components/ui/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';

const statConfig = [
  { key: 'totalMembers', label: 'Total members' },
  { key: 'presentLastService', label: 'Present last service' },
  { key: 'lateLastService', label: 'Late last service' },
  { key: 'contributionsOverdue', label: 'Contributions overdue' },
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

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statConfig.map((stat) => {
          const value = summary?.[stat.key];
          const comingSoon = summary && (value === null || value === undefined);

          return (
            <Card key={stat.key}>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                {stat.label}
              </p>
              <p className='mt-2 font-display text-3xl font-semibold text-brand-500 dark:text-brand-300'>
                {loading ? '…' : comingSoon ? '—' : value}
              </p>
              {comingSoon && !loading && (
                <p className='mt-1 text-xs text-zinc-400 dark:text-zinc-500'>
                  Coming soon
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          Attendance and contribution trends will render here once the check-in
          and contributions features are wired up.
        </p>
      </Card>
    </div>
  );
}
