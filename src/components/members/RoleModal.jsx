import { useState } from 'react';
import Button from '../ui/Button.jsx';
import FormSelect from '../ui/FormSelect.jsx';
import Modal from '../ui/Modal.jsx';
import {
  makeUnitHead,
  removeUnitHead,
  makeMainAdmin,
  removeMainAdmin,
} from '../../services/roleService.js';

const roleOptions = [
  { value: 'member', label: 'Member' },
  { value: 'unit_admin', label: 'Unit head' },
  { value: 'main_admin', label: 'Main admin' },
];

const roleLabel = {
  member: 'Member',
  unit_admin: 'Unit head',
  main_admin: 'Main admin',
};

export default function RoleModal({ member, onClose, onSaved }) {
  const [role, setRole] = useState(member.role);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (role === member.role) {
      onClose();
      return;
    }

    setError('');
    setSaving(true);
    try {
      // The backend only exposes "make X" / "remove X" — stepping down
      // from the current role first (if it was a privileged one) then
      // stepping up into the new one composes correctly for every
      // combination, since each "remove" always resolves to 'member'.
      let result;
      if (member.role === 'main_admin') result = await removeMainAdmin(member._id);
      if (member.role === 'unit_admin') result = await removeUnitHead(member._id);
      if (role === 'unit_admin') result = await makeUnitHead(member._id);
      if (role === 'main_admin') result = await makeMainAdmin(member._id);

      onSaved(result?.member ?? { ...member, role });
    } catch (err) {
      setError(err.message || 'Could not change role.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Change role for ${member.fullName}`} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Currently: <span className="font-medium text-zinc-700 dark:text-zinc-300">{roleLabel[member.role]}</span>
        </p>

        <FormSelect
          id="role"
          label="New role"
          options={roleOptions}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          A unit can have at most two heads, and a department at most two main admins.
        </p>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
