import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    apiFetch('/public/departments')
      .then((data) => setDepartments(data.departments))
      .catch(() =>
        setError('Could not load departments. Refresh and try again.'),
      );
  }, []);

  useEffect(() => {
    if (!form.department) {
      setUnits([]);
      return;
    }
    apiFetch(`/public/departments/${form.department}/units`)
      .then((data) => setUnits(data.units))
      .catch(() => setError('Could not load units for that department.'));
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
      <div className='relative hidden w-[38%] shrink-0 overflow-hidden bg-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-10'>
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

        <h2 className='relative font-display text-3xl font-semibold leading-tight text-white'>
          Join your unit and check in from your phone.
        </h2>

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
              placeholder='Select a department'
              options={departments.map((d) => ({
                value: d._id,
                label: d.name,
              }))}
              value={form.department}
              onChange={handleChange('department')}
              required
            />

            <FormSelect
              id='unit'
              label='Unit'
              placeholder={
                form.department ? 'Select a unit' : 'Select a department first'
              }
              options={units.map((u) => ({ value: u._id, label: u.name }))}
              value={form.unit}
              onChange={handleChange('unit')}
              disabled={!form.department}
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
