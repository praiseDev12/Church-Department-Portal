import { useState } from 'react';
import Button from '../ui/Button.jsx';
import FormInput from '../ui/FormInput.jsx';
import FormSelect from '../ui/FormSelect.jsx';
import Modal from '../ui/Modal.jsx';
import PhotoUpload from './PhotoUpload.jsx';
import { updateMember } from '../../services/memberService.js';

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

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function EditMemberModal({
  member,
  onClose,
  onSaved,
  onPhotoChanged = () => {},
}) {
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl || '');
  const [form, setForm] = useState({
    fullName: member.fullName || '',
    dateOfBirth: toDateInputValue(member.dateOfBirth),
    gender: member.gender || '',
    maritalStatus: member.maritalStatus || '',
    phoneNumber: member.phoneNumber || '',
    whatsappNumber: member.whatsappNumber || '',
    email: member.email || '',
    address: member.address || '',
    occupation: member.occupation || '',
    roleInUnit: member.roleInUnit || '',
    dateJoinedDepartment: toDateInputValue(member.dateJoinedDepartment),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Empty date strings would fail Mongoose's Date cast on the backend —
      // omit them entirely rather than send a blank value.
      const payload = { ...form };
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (!payload.dateJoinedDepartment) delete payload.dateJoinedDepartment;

      const data = await updateMember(member._id, payload);
      onSaved(data.member);
    } catch (err) {
      setError(err.message || 'Could not update member.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title='Edit member' maxWidth='max-w-lg'>
      <form
        onSubmit={handleSubmit}
        className='flex max-h-[70vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-brand dark:scrollbar-thumb-zinc-800 flex-col gap-4 overflow-y-auto pr-1'
      >
        <PhotoUpload
          memberId={member._id}
          currentPhotoUrl={photoUrl}
          name={member.fullName}
          onUploaded={(updated) => {
            setPhotoUrl(updated.photoUrl);
            onPhotoChanged(updated);
          }}
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

        <div className='grid grid-cols-2 gap-4'>
          <FormInput
            id='occupation'
            label='Occupation'
            type='text'
            value={form.occupation}
            onChange={handleChange('occupation')}
          />
          <FormInput
            id='roleInUnit'
            label='Role in unit'
            type='text'
            value={form.roleInUnit}
            onChange={handleChange('roleInUnit')}
          />
        </div>

        <FormInput
          id='dateJoinedDepartment'
          label='Date joined'
          type='date'
          value={form.dateJoinedDepartment}
          onChange={handleChange('dateJoinedDepartment')}
        />

        {error && (
          <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
        )}

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
