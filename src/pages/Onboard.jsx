import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, UserCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import FormSelect from '../components/ui/FormSelect.jsx';
import BrandLockup from '../components/ui/BrandLockup.jsx';
import DevelopedByCredit from '../components/ui/DevelopedByCredit.jsx';

const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const initialForm = {
  departmentName: '',
  unitName: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  address: '',
  occupation: '',
  password: '',
  setupCode: '',
};

const whatYouGet = [
  {
    icon: Building2,
    title: 'Your department',
    detail: 'A dedicated space for your department’s members and records.',
  },
  {
    icon: Users,
    title: 'A first unit',
    detail: 'Members are grouped into units — add more any time.',
  },
  {
    icon: UserCircle,
    title: 'Your main admin account',
    detail:
      'You\u2019re a member too — full profile, plus full department access.',
  },
];

export default function Onboard() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/auth/onboard', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login(data); // saves { token, user } — role is main_admin
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
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
            Set up in minutes, run for years.
          </h2>
          <ul className='flex flex-col gap-5'>
            {whatYouGet.map(({ icon: Icon, title, detail }) => (
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
      <div className='flex flex-1 items-center justify-center py-10 px-4 sm:px-8'>
        <div className='w-full max-w-lg'>
          <div className='lg:hidden flex-center gap-3 mb-5'>
            <BrandLockup variant='light' />
          </div>

          <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
            Set up your department
          </h1>
          <p className='mt-1.5 text-sm text-zinc-500 dark:text-zinc-400'>
            Creates your department, a first unit, and your own member profile
            as main admin.
          </p>

          <form onSubmit={handleSubmit} className='mt-7 flex flex-col gap-4'>
            <p className='text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>
              Department
            </p>
            <FormInput
              id='departmentName'
              label='Department name'
              type='text'
              required
              placeholder='e.g. Youth Department'
              value={form.departmentName}
              onChange={handleChange('departmentName')}
            />
            <FormInput
              id='unitName'
              label='First unit name'
              hint='(optional — defaults to "General")'
              type='text'
              placeholder='e.g. Ushering'
              value={form.unitName}
              onChange={handleChange('unitName')}
            />

            <p className='mt-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500'>
              Your details
            </p>
            <FormInput
              id='fullName'
              label='Full name'
              type='text'
              required
              value={form.fullName}
              onChange={handleChange('fullName')}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                id='dateOfBirth'
                label='Date of birth'
                type='date'
                required
                value={form.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
              />
              <FormSelect
                id='gender'
                label='Gender'
                placeholder='Select'
                options={genderOptions}
                value={form.gender}
                onChange={handleChange('gender')}
                required
              />
            </div>

            <FormSelect
              id='maritalStatus'
              label='Marital status'
              placeholder='Select'
              options={maritalStatusOptions}
              value={form.maritalStatus}
              onChange={handleChange('maritalStatus')}
              required
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                id='phoneNumber'
                label='Phone number'
                type='tel'
                required
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
              />
              <FormInput
                id='whatsappNumber'
                label='WhatsApp number'
                hint='(optional)'
                type='tel'
                value={form.whatsappNumber}
                onChange={handleChange('whatsappNumber')}
              />
            </div>

            <FormInput
              id='email'
              label='Email'
              type='email'
              required
              value={form.email}
              onChange={handleChange('email')}
            />

            <FormInput
              id='address'
              label='Address'
              type='text'
              required
              value={form.address}
              onChange={handleChange('address')}
            />

            <FormInput
              id='occupation'
              label='Occupation'
              hint='(optional)'
              type='text'
              value={form.occupation}
              onChange={handleChange('occupation')}
            />

            <FormInput
              id='password'
              label='Password'
              type='password'
              required
              minLength={8}
              value={form.password}
              onChange={handleChange('password')}
              helperText='At least 8 characters.'
            />

            <FormInput
              id='setupCode'
              label='Setup code'
              hint='(given to you by the platform administrator)'
              type='password'
              required
              value={form.setupCode}
              onChange={handleChange('setupCode')}
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
                'Setting up…'
              ) : (
                <>
                  Create department <ArrowRight className='h-4 w-4' />
                </>
              )}
            </Button>
          </form>

          <p className='mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400'>
            Already set up?{' '}
            <Link
              to='/login'
              className='font-medium text-brand-500 hover:underline dark:text-brand-300'
            >
              Sign in
            </Link>
          </p>
          <div className='flex items-center justify-center gap-x-4 mt-8 text-gray-400'>
            <hr className='w-full' />
            <p className='text-xs text-nowrap'>Not setting up a department?</p>
            <hr className='w-full' />
          </div>
          <Link to='/register'>
            <button className='hover:text-brand-500 mt-3 w-full rounded-lg bg-transparent border px-4 py-2 border-brand-200 text-xs lg:text-sm text-gray-500'>
              Join as a member
            </button>
          </Link>
          <DevelopedByCredit className='lg:hidden text-gray-400 text-xs text-center mt-10' />
        </div>
      </div>
    </div>
  );
}
