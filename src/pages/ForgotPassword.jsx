import { useEffect, useState } from 'react';

import { Link, ArrowLeft, ArrowRight, Mail } from 'lucide-react';

import { apiFetch } from '../lib/api.js';

import Button from '../components/ui/Button.jsx';

import FormInput from '../components/ui/FormInput.jsx';

import BrandLockup from '../components/ui/BrandLockup.jsx';

import DevelopedByCredit from '../components/ui/DevelopedByCredit.jsx';

const whatYouCanDo = [
  {
    icon: Mail,
    title: 'Secure recovery',
    detail: 'Get a secure link to reset your password.',
  },
  {
    icon: ArrowRight,
    title: 'Quick access',
    detail: 'Get back into your department account quickly.',
  },
  {
    icon: ArrowLeft,
    title: 'Simple process',
    detail: 'Follow a few simple steps to regain access.',
  },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Forgot Password';
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setSuccess(
        data.message ||
          'If an account with that email exists, a password reset link has been sent',
      );
    } catch (err) {
      setError(
        err.message ||
          'Unable to process your password reset request. Please try again.',
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
            Let’s get you back into your account.
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

          {/* Heading */}
          <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
            Forgot your password?
          </h1>

          <p className='mt-1.5 text-sm text-zinc-500 dark:text-zinc-400'>
            Enter your email and we’ll send you a secure link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className='mt-7 flex flex-col gap-4'>
            <FormInput
              id='email'
              label='Email'
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && (
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            )}

            {success && (
              <div className='rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400'>
                {success}
              </div>
            )}

            <Button
              type='submit'
              disabled={loading}
              className='mt-2 w-full justify-center'
            >
              {loading ? (
                'Sending link…'
              ) : (
                <>
                  Send reset link
                  <ArrowRight className='h-4 w-4' />
                </>
              )}
            </Button>
          </form>

          {/* Back to login */}
          <div className='mt-6 text-center'>
            <Link
              to='/login'
              className='inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to login
            </Link>
          </div>

          <DevelopedByCredit className='mt-10 text-center text-xs text-gray-400 lg:hidden' />
        </div>
      </div>
    </div>
  );
}
