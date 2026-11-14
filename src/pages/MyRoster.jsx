import { useEffect, useMemo, useState } from 'react';

import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ChevronRight,
  History,
} from 'lucide-react';

import { apiFetch } from '../lib/api.js';

import Card from '../components/ui/Card.jsx';
import AppLoader from '../components/ui/AppLoader.jsx';

const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatShortDate = (dateString) => {
  if (!dateString) return {};

  const date = new Date(`${dateString}T00:00:00`);

  return {
    day: date.toLocaleDateString([], {
      day: 'numeric',
    }),
    month: date.toLocaleDateString([], {
      month: 'short',
    }),
    weekday: date.toLocaleDateString([], {
      weekday: 'short',
    }),
  };
};

const formatTime = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getAssignmentDateTime = (assignment) => {
  return new Date(`${assignment.date}T${assignment.startTime || '00:00'}:00`);
};

const getDaysUntil = (assignment) => {
  const now = new Date();
  const assignmentDate = getAssignmentDateTime(assignment);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const target = new Date(
    assignmentDate.getFullYear(),
    assignmentDate.getMonth(),
    assignmentDate.getDate(),
  );

  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const getRelativeDate = (assignment) => {
  const days = getDaysUntil(assignment);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';

  return `In ${days} days`;
};

export default function MyRoster() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My Roster';

    const loadMyRoster = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiFetch('/roster/my-roster');

        setAssignments(response.assignments || []);
      } catch (err) {
        console.error('Load my roster error:', err);
        setError(err.message || 'Failed to load your roster.');
      } finally {
        setLoading(false);
      }
    };

    loadMyRoster();
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();

    const sortedAssignments = [...assignments].sort(
      (a, b) =>
        getAssignmentDateTime(a).getTime() - getAssignmentDateTime(b).getTime(),
    );

    return {
      upcoming: sortedAssignments.filter(
        (assignment) => getAssignmentDateTime(assignment) >= now,
      ),
      past: sortedAssignments
        .filter((assignment) => getAssignmentDateTime(assignment) < now)
        .reverse(),
    };
  }, [assignments]);

  const nextAssignment = upcoming[0];

  if (loading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <AppLoader />
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      {/* Header */}
      <div>
        <div className='flex items-center gap-2'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
            <CalendarDays className='h-5 w-5' />
          </div>

          <div>
            <h1 className='font-display text-xl font-semibold text-gray-900 dark:text-white lg:text-2xl'>
              My Roster
            </h1>

            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400 lg:text-sm'>
              Your upcoming unit assignments at a glance.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 lg:text-sm'>
            {error}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!error && assignments.length === 0 && (
        <Card>
          <div className='flex flex-col items-center justify-center px-4 py-14 text-center'>
            <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
              <CalendarDays className='h-7 w-7' />
            </div>

            <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
              No assignments yet
            </h2>

            <p className='mt-2 max-w-md text-xs leading-6 text-gray-500 dark:text-gray-400 lg:text-sm'>
              You don't have any published roster assignments yet. Your
              assignments will appear here once a roster is published.
            </p>
          </div>
        </Card>
      )}

      {!error && assignments.length > 0 && (
        <>
          {/* Summary */}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            <div className='rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900'>
              <p className='text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500'>
                Upcoming
              </p>

              <p className='mt-1 font-display text-2xl font-semibold text-gray-900 dark:text-white'>
                {upcoming.length}
              </p>

              <p className='mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400'>
                assignments
              </p>
            </div>

            <div className='rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900'>
              <p className='text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500'>
                Completed
              </p>

              <p className='mt-1 font-display text-2xl font-semibold text-gray-900 dark:text-white'>
                {past.length}
              </p>

              <p className='mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400'>
                previous assignments
              </p>
            </div>

            <div className='col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-1'>
              <p className='text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500'>
                Next
              </p>

              <p className='mt-1 truncate font-display text-base font-semibold text-gray-900 dark:text-white'>
                {nextAssignment
                  ? getRelativeDate(nextAssignment)
                  : 'All caught up'}
              </p>

              <p className='mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400'>
                {nextAssignment?.eventName || 'No upcoming assignment'}
              </p>
            </div>
          </div>

          {/* Next assignment */}
          {nextAssignment && (
            <Card>
              <div className='relative overflow-hidden'>
                <div className='absolute -right-16 -top-20 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl' />

                <div className='relative space-y-5'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'>
                          Next Assignment
                        </span>

                        <span className='text-[10px] font-medium text-gray-400 dark:text-gray-500'>
                          {getRelativeDate(nextAssignment)}
                        </span>
                      </div>

                      <h2 className='mt-3 font-display text-xl font-semibold text-gray-900 dark:text-white'>
                        {nextAssignment.eventName}
                      </h2>

                      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                        Your next scheduled unit duty
                      </p>
                    </div>

                    <div className='shrink-0'>
                      <span className='inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm'>
                        <UserRound className='h-3.5 w-3.5' />
                        {nextAssignment.roleName || 'Assigned'}
                      </span>
                    </div>
                  </div>

                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-zinc-900 dark:text-brand-400'>
                        <CalendarDays className='h-4.5 w-4.5' />
                      </div>

                      <div className='min-w-0'>
                        <p className='text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                          Date
                        </p>

                        <p className='mt-0.5 text-xs font-semibold text-gray-900 dark:text-white'>
                          {formatDate(nextAssignment.date)}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-zinc-900 dark:text-brand-400'>
                        <Clock3 className='h-4.5 w-4.5' />
                      </div>

                      <div className='min-w-0'>
                        <p className='text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                          Time
                        </p>

                        <p className='mt-0.5 text-xs font-semibold text-gray-900 dark:text-white'>
                          {formatTime(nextAssignment.startTime)}
                          {nextAssignment.endTime
                            ? ` - ${formatTime(nextAssignment.endTime)}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {nextAssignment.location && (
                    <div className='flex items-center gap-2 border-t border-zinc-100 pt-4 text-xs text-gray-500 dark:border-zinc-800 dark:text-gray-400'>
                      <MapPin className='h-4 w-4 shrink-0 text-brand-500' />
                      <span>{nextAssignment.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Upcoming assignments */}
          {upcoming.length > 0 && (
            <section>
              <div className='mb-4 flex items-end justify-between'>
                <div>
                  <h2 className='font-display text-base font-semibold text-gray-900 dark:text-white'>
                    Upcoming Assignments
                  </h2>

                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    Your scheduled duties
                  </p>
                </div>

                <span className='rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'>
                  {upcoming.length}
                </span>
              </div>

              <div className='space-y-3'>
                {upcoming.map((assignment, index) => {
                  const shortDate = formatShortDate(assignment.date);

                  return (
                    <Card key={assignment.assignmentId}>
                      <div className='flex items-center gap-3 sm:gap-4'>
                        {/* Date */}
                        <div className='flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20'>
                          <span className='text-[9px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400'>
                            {shortDate.month}
                          </span>

                          <span className='font-display text-xl font-semibold leading-none text-brand-700 dark:text-brand-300'>
                            {shortDate.day}
                          </span>

                          <span className='mt-0.5 text-[8px] font-medium text-brand-500 dark:text-brand-400'>
                            {shortDate.weekday}
                          </span>
                        </div>

                        {/* Details */}
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'>
                            <h3 className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
                              {assignment.eventName}
                            </h3>

                            {index === 0 && (
                              <span className='w-fit rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'>
                                Next
                              </span>
                            )}
                          </div>

                          <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-gray-500 dark:text-gray-400'>
                            <span className='flex items-center gap-1'>
                              <Clock3 className='h-3 w-3' />
                              {formatTime(assignment.startTime)}
                              {assignment.endTime
                                ? ` - ${formatTime(assignment.endTime)}`
                                : ''}
                            </span>

                            {assignment.location && (
                              <span className='flex items-center gap-1'>
                                <MapPin className='h-3 w-3' />
                                <span className='max-w-36 truncate'>
                                  {assignment.location}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Role */}
                        <div className='hidden shrink-0 sm:block'>
                          <span className='inline-flex max-w-44 items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[11px] font-medium text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/20 dark:text-brand-300'>
                            <UserRound className='h-3 w-3' />
                            <span className='truncate'>
                              {assignment.roleName || 'Assigned'}
                            </span>
                          </span>
                        </div>

                        <ChevronRight className='h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600' />
                      </div>

                      {/* Mobile role */}
                      <div className='mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800 sm:hidden'>
                        <span className='inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'>
                          <UserRound className='h-3 w-3' />
                          {assignment.roleName || 'Assigned'}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Previous assignments */}
          {past.length > 0 && (
            <section>
              <div className='mb-4 flex items-end justify-between'>
                <div>
                  <div className='flex items-center gap-2'>
                    <History className='h-4 w-4 text-gray-400 dark:text-gray-500' />

                    <h2 className='font-display text-base font-semibold text-gray-900 dark:text-white'>
                      Previous Assignments
                    </h2>
                  </div>

                  <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                    Your completed roster duties
                  </p>
                </div>

                <span className='rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-500 dark:bg-zinc-800 dark:text-gray-400'>
                  {past.length}
                </span>
              </div>

              <div className='space-y-2'>
                {past.map((assignment) => (
                  <Card key={assignment.assignmentId}>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-500'>
                        <CalendarDays className='h-4 w-4' />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <h3 className='truncate text-xs font-medium text-gray-700 dark:text-gray-300'>
                          {assignment.eventName}
                        </h3>

                        <div className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400 dark:text-gray-500'>
                          <span>{formatDate(assignment.date)}</span>

                          <span>
                            {formatTime(assignment.startTime)}
                            {assignment.endTime
                              ? ` - ${formatTime(assignment.endTime)}`
                              : ''}
                          </span>

                          {assignment.location && (
                            <span className='truncate'>
                              {assignment.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className='hidden shrink-0 text-[10px] font-medium text-gray-400 dark:text-gray-500 sm:block'>
                        {assignment.roleName || 'Assigned'}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
