import { useEffect, useState } from 'react';
import { CalendarCheck, CalendarDays, Clock3 } from 'lucide-react';

import { getMyAttendance } from '../services/checkInService.js';

export default function MemberAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My Attendance';

    let mounted = true;

    async function loadAttendance() {
      try {
        setLoading(true);
        setError('');

        const data = await getMyAttendance();

        if (!mounted) return;

        setAttendance(Array.isArray(data?.attendance) ? data?.attendance : []);
      } catch (err) {
        if (!mounted) return;

        console.error('MemberAttendance error:', err);
        setError(err.message || 'Failed to load your attendance');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const onTimeCount = attendance.filter(
    (record) => record.status === 'on_time',
  ).length;

  const lateCount = attendance.filter(
    (record) => record.status === 'late',
  ).length;

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      <div>
        <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
          My Attendance
        </h1>

        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
          View your attendance history and service records.
        </p>
      </div>

      {error && (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'>
          {error}
        </div>
      )}

      <section className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Services Attended
              </p>

              <p className='mt-2 font-display text-3xl font-semibold text-zinc-900 dark:text-white'>
                {loading ? '...' : attendance.length}
              </p>
            </div>

            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <CalendarCheck
                size={21}
                className='text-zinc-700 dark:text-zinc-300'
              />
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>On Time</p>

            <p className='mt-2 font-display text-3xl font-semibold text-emerald-600 dark:text-emerald-400'>
              {loading ? '...' : onTimeCount}
            </p>
          </div>
        </div>

        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>Late</p>

            <p className='mt-2 font-display text-3xl font-semibold text-amber-600 dark:text-amber-400'>
              {loading ? '...' : lateCount}
            </p>
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='border-b border-zinc-200 p-5 dark:border-zinc-800'>
          <h2 className='font-display text-lg font-semibold text-zinc-900 dark:text-white'>
            Attendance History
          </h2>
        </div>

        {loading ? (
          <div className='p-6 text-sm text-zinc-500 dark:text-zinc-400'>
            Loading your attendance...
          </div>
        ) : attendance.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-6 py-12 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <CalendarCheck
                size={22}
                className='text-zinc-500 dark:text-zinc-400'
              />
            </div>

            <h3 className='mt-4 font-medium text-zinc-900 dark:text-white'>
              No attendance records yet
            </h3>

            <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
              Your attendance records will appear here after you check in.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-zinc-200 dark:divide-zinc-800'>
            {attendance.map((record) => (
              <div
                key={record._id}
                className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='min-w-0'>
                  <p className='font-medium text-zinc-900 dark:text-white'>
                    {record.service?.name || 'Service'}
                  </p>

                  <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400'>
                    <span className='flex items-center gap-1.5'>
                      <CalendarDays size={15} />
                      {formatDate(record.checkedInAt)}
                    </span>

                    <span className='flex items-center gap-1.5'>
                      <Clock3 size={15} />
                      {formatTime(record.checkedInAt)}
                    </span>
                  </div>

                  {record.unit?.name && (
                    <p className='mt-1 text-xs text-zinc-400 dark:text-zinc-500'>
                      Unit: {record.unit.name}
                    </p>
                  )}
                </div>

                <span
                  className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    record.status === 'on_time'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}
                >
                  {record.status === 'on_time' ? 'On time' : 'Late'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
