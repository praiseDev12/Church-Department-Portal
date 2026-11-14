import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import {
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MapPin,
  UserRound,
  Users,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

import PhotoUpload from '../components/members/PhotoUpload.jsx';

import { getMyAttendance } from '../services/checkInService.js';
import { getMyContributions } from '../services/contributionService.js';
import { apiFetch } from '../lib/api.js';

export default function MemberHome() {
  const { user, login, token } = useAuth();

  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');

  const [attendance, setAttendance] = useState([]);

  const [contributions, setContributions] = useState({
    entries: [],
    totalAmount: 0,
  });

  const [nextAssignment, setNextAssignment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  function handlePhotoUploaded(updatedMember) {
    setPhotoUrl(updatedMember.photoUrl);

    // Keep the session's cached user in sync so the new photo shows
    // immediately anywhere else it's referenced (e.g. after a refresh).
    login({
      token,
      user: {
        ...user,
        photoUrl: updatedMember.photoUrl,
      },
    });
  }

  useEffect(() => {
    document.title = 'Home';
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [attendanceData, contributionData, rosterData] =
          await Promise.all([
            getMyAttendance(),
            getMyContributions(),
            apiFetch('/roster/my-roster'),
          ]);

        if (!mounted) return;

        setAttendance(
          Array.isArray(attendanceData?.attendance)
            ? attendanceData.attendance
            : [],
        );

        setContributions({
          entries: Array.isArray(contributionData?.entries)
            ? contributionData.entries
            : [],
          totalAmount: Number(contributionData?.totalAmount || 0),
        });

        const assignments = Array.isArray(rosterData?.assignments)
          ? rosterData.assignments
          : [];

        const now = new Date();

        const upcomingAssignments = assignments
          .filter((assignment) => {
            if (!assignment?.date) return false;

            const assignmentDate = new Date(
              `${assignment.date}T${assignment.startTime || '00:00'}:00`,
            );

            return assignmentDate >= now;
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime || '00:00'}:00`);

            const dateB = new Date(`${b.date}T${b.startTime || '00:00'}:00`);

            return dateA.getTime() - dateB.getTime();
          });

        setNextAssignment(upcomingAssignments[0] || null);
      } catch (err) {
        if (!mounted) return;

        console.error('MemberHome dashboard error:', err);

        setError(err.message || 'Failed to load dashboard data');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const onTimeCount = attendance.filter(
    (record) => record.status === 'on_time',
  ).length;

  const lateCount = attendance.filter(
    (record) => record.status === 'late',
  ).length;

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  const formatAmount = (amount) =>
    `₦${Number(amount || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatAssignmentDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAssignmentTime = (time) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getAssignmentRelativeDate = (assignment) => {
    if (!assignment?.date) return '';

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const assignmentDate = new Date(`${assignment.date}T00:00:00`);

    const target = new Date(
      assignmentDate.getFullYear(),
      assignmentDate.getMonth(),
      assignmentDate.getDate(),
    );

    const difference = Math.round(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (difference === 0) return 'Today';

    if (difference === 1) return 'Tomorrow';

    if (difference > 1) return `In ${difference} days`;

    return '';
  };

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      {/* Welcome */}
      <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
          <div className='flex flex-col items-center gap-4 lg:flex-row'>
            <PhotoUpload
              memberId={user?.id}
              currentPhotoUrl={photoUrl}
              name={user?.fullName}
              onUploaded={handlePhotoUploaded}
            />

            <div className='max-md:w-full'>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Welcome back
              </p>

              <h1 className='mt-1 font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
                {firstName}!
              </h1>

              <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400 lg:text-sm'>
                Here's a quick look at your department activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'>
          {error}
        </div>
      )}

      {/* Next Roster Assignment */}
      {!error && (
        <section className='overflow-hidden rounded-2xl bg-brand-50/60 dark:bg-brand-900'>
          <div className='p-5 sm:p-6'>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'>
                    <CalendarDays className='h-4.5 w-4.5' />
                  </div>

                  <div>
                    <p className='text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400'>
                      Your Next Assignment
                    </p>

                    {!loading && nextAssignment && (
                      <p className='mt-0.5 text-[11px] font-medium text-brand-500 dark:text-brand-400'>
                        {getAssignmentRelativeDate(nextAssignment)}
                      </p>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className='mt-4 space-y-2'>
                    <div className='h-5 w-48 animate-pulse rounded bg-brand-100 dark:bg-brand-900/30' />
                    <div className='h-3 w-64 animate-pulse rounded bg-brand-100 dark:bg-brand-900/30' />
                  </div>
                ) : nextAssignment ? (
                  <>
                    <h2 className='mt-4 truncate font-display text-lg font-semibold text-zinc-900 dark:text-white sm:text-xl'>
                      {nextAssignment.eventName}
                    </h2>

                    <div className='mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400'>
                      <span className='flex items-center gap-1.5'>
                        <CalendarDays className='h-3.5 w-3.5 text-brand-500' />
                        {formatAssignmentDate(nextAssignment.date)}
                      </span>

                      <span className='flex items-center gap-1.5'>
                        <Clock3 className='h-3.5 w-3.5 text-brand-500' />
                        {formatAssignmentTime(nextAssignment.startTime)}

                        {nextAssignment.endTime
                          ? ` - ${formatAssignmentTime(nextAssignment.endTime)}`
                          : ''}
                      </span>

                      {nextAssignment.location && (
                        <span className='flex items-center gap-1.5'>
                          <MapPin className='h-3.5 w-3.5 text-brand-500' />
                          {nextAssignment.location}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className='mt-4 font-display text-lg font-semibold text-zinc-900 dark:text-white'>
                      No upcoming assignment
                    </h2>

                    <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
                      You currently have no upcoming published roster duty.
                    </p>
                  </>
                )}
              </div>

              {!loading && nextAssignment && (
                <div className='flex shrink-0 flex-col items-start gap-3 sm:items-end'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white'>
                    <UserRound className='h-3.5 w-3.5' />
                    {nextAssignment.roleName || 'Assigned'}
                  </span>

                  <Link
                    to='/portal/roster'
                    className='group inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300'
                  >
                    View My Roster
                    <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                  </Link>
                </div>
              )}

              {!loading && !nextAssignment && (
                <Link
                  to='/portal/roster'
                  className='group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300'
                >
                  View My Roster
                  <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Department / Unit */}
      <section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <Users size={20} className='text-zinc-700 dark:text-zinc-300' />
            </div>

            <div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Department
              </p>

              <p className='mt-1 font-display font-semibold text-zinc-900 dark:text-white'>
                {user?.department?.name || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <UserRound
                size={20}
                className='text-zinc-700 dark:text-zinc-300'
              />
            </div>

            <div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>Unit</p>

              <p className='mt-1 font-display font-semibold text-zinc-900 dark:text-white'>
                {user?.unit?.name || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* Attendance */}
        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Attendance
              </p>

              <p className='mt-2 font-display text-3xl font-semibold text-zinc-900 dark:text-white'>
                {loading ? '...' : attendance.length}
              </p>

              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Services attended
              </p>
            </div>

            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <CalendarCheck
                size={21}
                className='text-zinc-700 dark:text-zinc-300'
              />
            </div>
          </div>

          {!loading && (
            <div className='mt-5 flex gap-4 text-sm'>
              <span className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
                <span className='h-2 w-2 rounded-full bg-emerald-500' />
                {onTimeCount} on time
              </span>

              <span className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400'>
                <span className='h-2 w-2 rounded-full bg-amber-500' />
                {lateCount} late
              </span>
            </div>
          )}

          <Link
            to='/portal/attendance'
            className='mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-700 hover:text-brand dark:text-zinc-300 dark:hover:text-brand'
          >
            View attendance history
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Contributions */}
        <div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Contributions
              </p>

              <p className='mt-2 wrap-break-words font-display text-3xl font-semibold text-zinc-900 dark:text-white'>
                {loading ? '...' : formatAmount(contributions.totalAmount)}
              </p>

              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Total contributed
              </p>
            </div>

            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
              <CircleDollarSign
                size={21}
                className='text-zinc-700 dark:text-zinc-300'
              />
            </div>
          </div>

          {!loading && (
            <p className='mt-5 text-sm text-zinc-500 dark:text-zinc-400'>
              {contributions.entries.length}{' '}
              {contributions.entries.length === 1
                ? 'contribution'
                : 'contributions'}{' '}
              recorded
            </p>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='font-display text-lg font-semibold text-zinc-900 dark:text-white'>
            Quick Actions
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <Link
            to='/check-in'
            className='group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
                <Clock3
                  size={19}
                  className='text-zinc-700 dark:text-zinc-300'
                />
              </div>

              <div>
                <p className='font-medium text-zinc-900 dark:text-white'>
                  Check In
                </p>

                <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                  Record attendance
                </p>
              </div>
            </div>

            <ChevronRight
              size={18}
              className='text-zinc-400 transition group-hover:translate-x-0.5'
            />
          </Link>

          <Link
            to='/portal/contributions'
            className='group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
                <CircleDollarSign
                  size={19}
                  className='text-zinc-700 dark:text-zinc-300'
                />
              </div>

              <div>
                <p className='font-medium text-zinc-900 dark:text-white'>
                  Contributions
                </p>

                <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                  View your records
                </p>
              </div>
            </div>

            <ChevronRight
              size={18}
              className='text-zinc-400 transition group-hover:translate-x-0.5'
            />
          </Link>

          <Link
            to='/portal/roster'
            className='group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20'>
                <CalendarDays
                  size={19}
                  className='text-brand-600 dark:text-brand-400'
                />
              </div>

              <div>
                <p className='font-medium text-zinc-900 dark:text-white'>
                  My Roster
                </p>

                <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                  View your assignments
                </p>
              </div>
            </div>

            <ChevronRight
              size={18}
              className='text-zinc-400 transition group-hover:translate-x-0.5'
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
