import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import FormSelect from '../ui/FormSelect.jsx';
import Modal from '../ui/Modal.jsx';
import { apiFetch } from '../../lib/api.js';
import { changeMemberUnit } from '../../services/memberService.js';

export default function ChangeUnitModal({ member, onClose, onSaved }) {
  const [units, setUnits] = useState([]);
  const [unitId, setUnitId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Reuses the public departments/units listing — it only ever returns
    // id + name, which is exactly what a select dropdown needs here.
    apiFetch(`/public/departments/${member.department._id}/units`)
      .then((data) => {
        console.log(data);
        setUnits(data.units.filter((u) => u._id !== member.unit?._id));
      })
      .catch(() => setError('Could not load units.'))
      .finally(() => setLoadingUnits(false));
  }, [member]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!unitId) {
      setError('Please select a unit.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const data = await changeMemberUnit(member._id, unitId, note);
      onSaved(data.member);
    } catch (err) {
      setError(err.message || 'Could not change unit.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Change unit for ${member.fullName}`}>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <FormSelect
          id='unitId'
          label='New unit'
          placeholder={loadingUnits ? 'Loading units…' : 'Select a unit'}
          options={units.map((u) => ({ value: u._id, label: u.name }))}
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          disabled={loadingUnits}
          required
        />

        <div>
          <label
            htmlFor='note'
            className='mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300'
          >
            Note{' '}
            <span className='font-normal text-zinc-400 dark:text-zinc-500'>
              (optional)
            </span>
          </label>
          <textarea
            id='note'
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-brand-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
          />
        </div>

        {error && (
          <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
        )}

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' disabled={saving}>
            {saving ? 'Moving…' : 'Move member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
