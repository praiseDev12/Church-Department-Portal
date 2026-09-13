import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, CalendarCheck, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import FormSelect from '../components/ui/FormSelect.jsx';
import BrandLockup from '../components/ui/BrandLockup.jsx';
import DevelopedByCredit from '../components/ui/DevelopedByCredit.jsx';

// Same list as the Login page's panel, for visual and structural
// consistency between the two — a new member sees the same "what this
// does" pitch as someone signing back in.
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
  department: '',
  unit: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  address: '',
  occupation: '',
  roleInUnit: '',
  password: '',
};

export default function MemberRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(false);

  useEffect(() => {
    setDepartmentsLoading(true);

    apiFetch('/public/departments')
      .then((data) => setDepartments(data.departments))
      .catch(() =>
        setError('Could not load departments. Refresh and try again.'),
      )
      .finally(() => setDepartmentsLoading(false));
  }, []);

  useEffect(() => {
    if (!form.department) {
      setUnits([]);
      setUnitsLoading(false);
      return;
    }

    setUnitsLoading(true);
    setUnits([]);

    apiFetch(`/public/departments/${form.department}/units`)
      .then((data) => setUnits(data.units))
      .catch(() => setError('Could not load units for that department.'))
      .finally(() => setUnitsLoading(false));
  }, [form.department]);

  function handleChange(field) {
    return (e) => {
      const value = e.target.value;
      setForm((f) => {
        // Changing department invalidates whichever unit was picked before.
        if (field === 'department')
          return { ...f, department: value, unit: '' };
        return { ...f, [field]: value };
      });
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!consentAccepted) {
      setError('Please accept the privacy notice to continue.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, consentAccepted }),
      });
      login(data); // saves { token, member }
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'Register';
  }, []);

  return (
    <div className='flex min-h-screen bg-brand-50 dark:bg-zinc-900 text-black dark:text-white'>
      {/* Mobile-only decorative background — the brand panel below is
          hidden under lg, so without this the page is just a flat
          single-color fill. Fixed so it stays put regardless of how
          long the form gets, rather than scrolling with the content. */}
      <div className='fixed inset-0 z-0 overflow-hidden lg:hidden'>
        <div
          className='absolute inset-0 opacity-[0.15] dark:opacity-[0.08]'
          style={{
            backgroundImage:
              'radial-gradient(circle, #003599 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className='absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-300 opacity-30 blur-3xl dark:bg-brand-700 dark:opacity-20' />
        <div className='absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-200 opacity-30 blur-3xl dark:bg-brand-800 dark:opacity-20' />
      </div>

      {/* Decorative panel — matches Login's structure and width (42%).
          sticky + h-screen keeps it pinned to the viewport while the
          long form on the right scrolls past it, instead of stretching
          to match the form's full height and scrolling away with it. */}
      <div className='relative hidden w-[42%] shrink-0 overflow-hidden bg-brand-900 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-10'>
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
            Join your unit and check in from your phone.
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

      <div className='flex flex-1 items-center justify-center py-10 px-4 sm:px-8'>
        <div className='w-full max-w-lg'>
          <div className='lg:hidden flex-center gap-3 mb-5'>
            <BrandLockup variant='light' />
          </div>

          <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
            Create your member account
          </h1>
          <p className='mt-1.5 text-sm text-zinc-500 dark:text-zinc-400'>
            Used to check in to service and manage your own details.
          </p>

          <form onSubmit={handleSubmit} className='mt-7 flex flex-col gap-4'>
            <FormSelect
              id='department'
              label='Department'
              placeholder={
                departmentsLoading
                  ? 'Loading departments...'
                  : 'Select a department'
              }
              options={departments.map((d) => ({
                value: d._id,
                label: d.name,
              }))}
              value={form.department}
              onChange={handleChange('department')}
              disabled={departmentsLoading}
              required
            />

            <FormSelect
              id='unit'
              label='Unit'
              placeholder={
                unitsLoading
                  ? 'Loading units...'
                  : form.department
                    ? 'Select a unit'
                    : 'Select a department first'
              }
              options={units.map((u) => ({
                value: u._id,
                label: u.name,
              }))}
              value={form.unit}
              onChange={handleChange('unit')}
              disabled={!form.department || unitsLoading}
              required
            />
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

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                id='occupation'
                label='Occupation'
                hint='(optional)'
                type='text'
                value={form.occupation}
                onChange={handleChange('occupation')}
              />
              <FormInput
                id='roleInUnit'
                label='Role in unit'
                hint='(optional)'
                type='text'
                value={form.roleInUnit}
                onChange={handleChange('roleInUnit')}
              />
            </div>

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

            <label className='flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300'>
              <input
                type='checkbox'
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className='mt-0.5 h-4 w-4 rounded border-zinc-300 text-brand-500 focus:ring-brand-500 dark:border-zinc-600'
              />
              <span>
                I consent to my department storing this information for
                membership and attendance purposes.
              </span>
            </label>

            {error && (
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            )}

            <Button
              type='submit'
              disabled={loading}
              className='mt-2 w-full justify-center'
            >
              {loading ? (
                'Creating account…'
              ) : (
                <>
                  Create account <ArrowRight className='h-4 w-4' />
                </>
              )}
            </Button>
          </form>

          <p className='mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400'>
            Already registered?{' '}
            <Link
              to='/login'
              className='font-medium text-brand-500 hover:underline dark:text-brand-300'
            >
              Sign in
            </Link>
          </p>
          <DevelopedByCredit className='text-gray-400 text-xs text-center mt-10' />
        </div>
      </div>
    </div>
  );
}
