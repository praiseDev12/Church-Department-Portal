import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data); // saves { token, user }
      navigate(data.user.role === 'member' ? '/portal' : '/', {
        replace: true,
      });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen bg-brand-50 dark:bg-zinc-900 text-black dark:text-white'>
      {/* Decorative panel — hidden on small screens */}
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
            Pick up right where you left off.
          </h2>
          <ul className='flex flex-col gap-5'>
            {whatYouCanDo.map(({ icon: Icon, title, detail }) => (
              <li key={title} className='flex items-start gap-3.5'>
                <span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10'>
                  <Icon
                    className='h-[18px] w-[18px] text-white'
                    strokeWidth={1.75}
                  />
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
      <div className='flex flex-1 items-center justify-center py-10 px-4 sm:px-8'>
        <div className='w-full max-w-lg'>
          <div className='lg:hidden flex-center gap-3 mb-5'>
            <BrandLockup variant='light' />
          </div>

          <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
            Welcome back
          </h1>
          <p className='mt-1.5 text-sm text-zinc-500 dark:text-zinc-400'>
            Sign in to manage your department.
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

            <FormInput
              id='password'
              label='Password'
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            )}

            <Button
              type='submit'
              disabled={loading}
              className='mt-2 w-full justify-center'
            >
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  Sign in <ArrowRight className='h-4 w-4' />
                </>
              )}
            </Button>
          </form>

          <p className='mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400'>
            New member?{' '}
            <Link
              to='/register'
              className='font-medium text-brand-500 hover:underline dark:text-brand-300'
            >
              Create an account
            </Link>
            {' · '}
            <Link
              to='/onboard'
              className='font-medium text-brand-500 hover:underline dark:text-brand-300'
            >
              Set up a new department
            </Link>
          </p>
          <DevelopedByCredit className='lg:hidden text-gray-400 text-xs text-center mt-10' />
        </div>
      </div>
    </div>
  );
}
