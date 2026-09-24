import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  UserRound,
  Users,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

import PhotoUpload from '../components/members/PhotoUpload.jsx';

import { getMyAttendance } from '../services/checkInService.js';
import { getMyContributions } from '../services/contributionService.js';

export default function MemberHome() {
  const { user, login, token } = useAuth();

  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');

  const [attendance, setAttendance] = useState([]);
  const [contributions, setContributions] = useState({
    entries: [],
    totalAmount: 0,
  });

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

        const [attendanceData, contributionData] = await Promise.all([
          getMyAttendance(),
          getMyContributions(),
        ]);

        if (!mounted) return;

        setAttendance(
          Array.isArray(attendanceData?.attendance)
            ? attendanceData?.attendance
            : [],
        );

        setContributions({
          entries: Array.isArray(contributionData?.entries)
            ? contributionData.entries
            : [],
          totalAmount: Number(contributionData?.totalAmount || 0),
        });
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

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      {/* Welcome */}
      <section className='overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
          <div className='flex flex-col lg:flex-row items-center gap-4'>
            <PhotoUpload
              memberId={user?.id}
              currentPhotoUrl={photoUrl}
              name={user?.fullName}
              onUploaded={handlePhotoUploaded}
            />

            <div className='w-full'>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Welcome back
              </p>

              <h1 className='mt-1 font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
                {firstName}!
              </h1>

              <p className='mt-1 text-xs lg:text-sm text-zinc-500 dark:text-zinc-400'>
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
            to='/profile'
            className='group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
                <UserRound
                  size={19}
                  className='text-zinc-700 dark:text-zinc-300'
                />
              </div>

              <div>
                <p className='font-medium text-zinc-900 dark:text-white'>
                  My Profile
                </p>
                <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                  View your profile
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
