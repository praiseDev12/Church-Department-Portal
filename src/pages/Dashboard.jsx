import { useEffect, useState } from 'react';
import Card from '../components/ui/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';

import { ArrowRight, Cake } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const statConfig = [
  { key: 'totalMembers', label: 'Total members' },
  { key: 'presentLastService', label: 'Present last service' },
  { key: 'lateLastService', label: 'Late last service' },
  { key: 'absentLastService', label: 'Absent last service' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [birthdays, setBirthdays] = useState([]);

  const [error, setError] = useState('');
  const [birthdayError, setBirthdayError] = useState('');

  const [loading, setLoading] = useState(true);
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);

  const firstName = user?.fullName?.split(' ')[0] || 'User';

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

  useEffect(() => {
    let cancelled = false;

    apiFetch('/birthdays')
      .then((data) => {
        if (!cancelled) {
          setBirthdays(data.birthdays || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setBirthdayError(
            err.message || 'Could not load birthday information.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setBirthdaysLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  return (
    <div className='flex flex-col gap-6 dark:text-white px-3 py-2'>
      <div>
        <h1 className='font-display text-2xl font-semibold'>
          Welcome {firstName}
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
            <p className='text-xs lg:text-sm text-zinc-500 dark:text-zinc-400'>
              Latest service
            </p>

            <p className='mt-1 font-display text-sm lg:text-xs font-semibold'>
              {loading
                ? 'Loading...'
                : summary?.lastServiceName || 'No service recorded yet'}
            </p>

            {!loading && summary?.lastServiceDate && (
              <p className='mt-1 text-xs lg:text-sm text-zinc-500 dark:text-zinc-400'>
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
            <Link
              to='/attendance'
              className='inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-[10px] lg:text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
            >
              View attendance
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </Card>

      {/* Birthdays */}
      <Card>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <Cake size={18} className='text-brand-500 dark:text-brand-300' />

              <h2 className='font-display text-base font-semibold'>
                Birthdays this month
              </h2>
            </div>

            <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
              Celebrate members of your{' '}
              {user?.role === 'main_admin' ? 'department' : 'unit'}.
            </p>
          </div>
        </div>

        {birthdayError && (
          <p className='mt-4 text-sm text-red-600 dark:text-red-400'>
            {birthdayError}
          </p>
        )}

        {birthdaysLoading ? (
          <div className='mt-5 text-sm text-zinc-500 dark:text-zinc-400'>
            Loading birthdays...
          </div>
        ) : birthdays.length === 0 ? (
          <div className='mt-5 rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center dark:border-zinc-700'>
            <Cake
              size={28}
              className='mx-auto text-zinc-400 dark:text-zinc-500'
            />

            <p className='mt-3 text-sm font-medium'>No birthdays this month</p>

            <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
              There are no birthdays to celebrate yet.
            </p>
          </div>
        ) : (
          <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {birthdays.map((member) => {
              const birthday = new Date(member.dateOfBirth);

              return (
                <Link
                  key={member._id}
                  to='/birthdays/cards'
                  className='flex hover:bg-brand/40 hover:cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700'
                >
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className='h-12 w-12 shrink-0 rounded-full object-cover'
                    />
                  ) : (
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'>
                      {member.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold'>
                      {member.fullName}
                    </p>

                    <p className='mt-0.5 text-xs text-zinc-500 dark:text-zinc-400'>
                      {birthday.toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>

                    <p className='mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400'>
                      {member.unit?.name || 'No unit'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
