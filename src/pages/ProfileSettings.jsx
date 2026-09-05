import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateOwnProfile, getOwnProfile } from '../services/memberService.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import FormSelect from '../components/ui/FormSelect.jsx';
import PhotoUpload from '../components/members/PhotoUpload.jsx';

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

const emptyForm = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  address: '',
  occupation: '',
};

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toFormState(member) {
  return {
    fullName: member.fullName || '',
    dateOfBirth: toDateInputValue(member.dateOfBirth),
    gender: member.gender || '',
    maritalStatus: member.maritalStatus || '',
    phoneNumber: member.phoneNumber || '',
    whatsappNumber: member.whatsappNumber || '',
    email: member.email || '',
    address: member.address || '',
    occupation: member.occupation || '',
  };
}

export default function ProfileSettings() {
  const { user, login, token } = useAuth();

  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Profile Settings';
  }, []);

  useEffect(() => {
    let cancelled = false;

    getOwnProfile()
      .then((data) => {
        if (cancelled) return;
        setForm(toFormState(data.member));
        setPhotoUrl(data.member.photoUrl || '');
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err.message || 'Could not load your profile.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(field) {
    return (e) => {
      setSuccess(false);
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };
  }

  function syncSession(updates) {
    login({ token, user: { ...user, ...updates } });
  }

  function handlePhotoUploaded(updatedMember) {
    setPhotoUrl(updatedMember.photoUrl);
    syncSession({ photoUrl: updatedMember.photoUrl });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.dateOfBirth) delete payload.dateOfBirth;

      const data = await updateOwnProfile(payload);
      setForm(toFormState(data.member));
      syncSession(data.member);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='mx-auto flex max-w-lg flex-col gap-6'>
      <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
        Profile Settings
      </h1>

      <div className='flex justify-center'>
        <PhotoUpload
          memberId={user?.id}
          currentPhotoUrl={photoUrl}
          name={user?.fullName}
          onUploaded={handlePhotoUploaded}
        />
      </div>

      {loading ? (
        <Card>
          <p className='text-center text-sm text-zinc-500 dark:text-zinc-400'>
            Loading your profile…
          </p>
        </Card>
      ) : loadError ? (
        <Card>
          <p className='text-center text-sm text-red-600 dark:text-red-400'>
            {loadError}
          </p>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
              />
            </div>

            <FormSelect
              id='maritalStatus'
              label='Marital status'
              placeholder='Select'
              options={maritalStatusOptions}
              value={form.maritalStatus}
              onChange={handleChange('maritalStatus')}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                id='phoneNumber'
                label='Phone number'
                type='tel'
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
              value={form.email}
              onChange={handleChange('email')}
            />

            <FormInput
              id='address'
              label='Address'
              type='text'
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

            {error && (
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            )}
            {success && (
              <p className='text-sm text-emerald-600 dark:text-emerald-400'>
                Profile updated.
              </p>
            )}

            <Button
              type='submit'
              disabled={saving}
              className='mt-2 w-full justify-center'
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </Card>
      )}

      <p className='text-center text-xs text-zinc-400 dark:text-zinc-500'>
        Some details — your unit, role, and join date — can only be changed by
        your department's admin.
      </p>
    </div>
  );
}
