import { useEffect, useState } from 'react';

import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  Users,
  CalendarCheck,
  Wallet,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

import { apiFetch } from '../lib/api.js';

import Button from '../components/ui/Button.jsx';

import FormInput from '../components/ui/FormInput.jsx';

import BrandLockup from '../components/ui/BrandLockup.jsx';

import DevelopedByCredit from '../components/ui/DevelopedByCredit.jsx';

const whatYouCanDo = [
  {
    icon: Users,
    title: 'Members',
    detail: 'Keep every member’s details up to date.',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance',
    detail: 'Track check-ins and lateness at a glance.',
  },
  {
    icon: Wallet,
    title: 'Contributions',
    detail: 'Follow up on monthly payments with ease.',
  },
];

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Reset Password';
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await apiFetch(`/auth/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({
          password,
        }),
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(
        err.message ||
          'Unable to reset your password. The link may have expired.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen bg-brand-50 text-black dark:bg-zinc-900 dark:text-white'>
      {/* Decorative panel */}
      <div className='relative hidden w-[42%] shrink-0 overflow-hidden bg-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-10'>
        <div
          className='pointer-events-none absolute inset-0 opacity-[0.22]'
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className='pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-300 opacity-20 blur-3xl' />

        <BrandLockup variant='dark' />

        <div className='relative flex flex-col gap-8'>
          <h2 className='font-display text-3xl font-semibold leading-tight text-white'>
            Secure your account and get back to work.
          </h2>

          <ul className='flex flex-col gap-5'>
            {whatYouCanDo.map(({ icon: Icon, title, detail }) => (
              <li key={title} className='flex items-start gap-3.5'>
                <span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10'>
                  <Icon className='h-4.5 w-4.5 text-white' strokeWidth={1.75} />
                </span>

                <div>
                  <p className='text-sm font-medium text-white'>{title}</p>

                  <p className='mt-0.5 text-sm text-brand-100'>{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className='relative text-xs text-brand-100'>
            Built for any church department
          </p>

          <DevelopedByCredit className='text-brand-100 text-xs' />
        </div>
      </div>

      {/* Form panel */}
      <div className='flex flex-1 items-center justify-center px-4 py-10 sm:px-8'>
        <div className='w-full max-w-lg'>
          {/* Mobile brand */}
          <div className='mb-5 flex-center gap-3 lg:hidden'>
            <BrandLockup variant='light' />
          </div>

          {!success ? (
            <>
              <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
                Reset your password
              </h1>

              <p className='mt-1.5 text-sm text-zinc-500 dark:text-zinc-400'>
                Create a new password for your department account.
              </p>

              <form
                onSubmit={handleSubmit}
                className='mt-7 flex flex-col gap-4'
              >
                <FormInput
                  id='password'
                  label='New password'
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <FormInput
                  id='confirmPassword'
                  label='Confirm password'
                  type='password'
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && (
                  <p className='text-sm text-red-600 dark:text-red-400'>
                    {error}
                  </p>
                )}

                <Button
                  type='submit'
                  disabled={loading}
                  className='mt-2 w-full justify-center'
                >
                  {loading ? 'Resetting password…' : 'Reset password'}
                </Button>
              </form>

              <div className='mt-6 text-center'>
                <Link
                  to='/login'
                  className='inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <div className='text-center'>
              <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30'>
                <CheckCircle className='h-7 w-7 text-green-600 dark:text-green-400' />
              </div>

              <h1 className='mt-5 font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
                Password reset successfully
              </h1>

              <p className='mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400'>
                Your password has been updated. Redirecting you to the login
                page...
              </p>

              <Link
                to='/login'
                className='mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200'
              >
                <ArrowLeft className='h-4 w-4' />
                Go to login
              </Link>
            </div>
          )}

          <DevelopedByCredit className='mt-10 text-center text-xs text-gray-400 lg:hidden' />
        </div>
      </div>
    </div>
  );
}
