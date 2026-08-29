import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Shield,
  MoreVertical,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

import {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../services/unitService.js';

function LoadingState() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <div className='animate-pulse space-y-3'>
            <div className='h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800' />
            <div className='h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800' />
            <div className='h-8 w-full rounded bg-zinc-200 dark:bg-zinc-800' />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <Card>
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'>
          <AlertTriangle size={22} />
        </div>

        <h3 className='font-medium text-zinc-900 dark:text-white'>
          Unable to load units
        </h3>

        <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
          {error}
        </p>

        <Button variant='secondary' className='mt-4' onClick={onRetry}>
          <RefreshCw size={16} />
          Try again
        </Button>
      </div>
    </Card>
  );
}

function EmptyState({ onAdd }) {
  return (
    <Card>
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
          <Users size={25} />
        </div>

        <h3 className='font-medium text-zinc-900 dark:text-white'>
          No units created yet
        </h3>

        <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
          Create your first unit to start organizing department members.
        </p>

        <Button className='mt-4' onClick={onAdd}>
          <Plus size={16} />
          Add unit
        </Button>
      </div>
    </Card>
  );
}

function UnitForm({
  initialName = '',
  onSubmit,
  onCancel,
  loading,
  error,
  submitLabel,
}) {
  const [name, setName] = useState(initialName);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onSubmit({
      name: trimmedName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='unit-name'
          className='mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300'
        >
          Unit name
        </label>

        <input
          id='unit-name'
          type='text'
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder='e.g. Choir'
          autoFocus
          disabled={loading}
          className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
        />
      </div>

      {error && (
        <div className='rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400'>
          {error}
        </div>
      )}

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='secondary'
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button type='submit' disabled={loading || !name.trim()}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function DeleteUnitForm({ unit, onSubmit, onCancel, loading, error }) {
  const [setupCode, setSetupCode] = useState('');

  const memberCount = Number(unit?.memberCount || 0);
  const hasMembers = memberCount > 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedCode = setupCode.trim();

    if (!trimmedCode || hasMembers) {
      return;
    }

    onSubmit(trimmedCode);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10'>
        <div className='flex gap-3'>
          <AlertTriangle className='mt-0.5 shrink-0 text-red-500' size={20} />

          <div>
            <p className='font-medium text-red-800 dark:text-red-300'>
              Delete "{unit.name}"?
            </p>

            <p className='mt-1 text-sm text-red-700 dark:text-red-400'>
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {hasMembers && (
        <div className='rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'>
          This unit currently has {memberCount}{' '}
          {memberCount === 1 ? 'member' : 'members'}.
          <p className='mt-1'>
            You must move those members to another unit before this unit can be
            deleted.
          </p>
        </div>
      )}

      {!hasMembers && (
        <>
          <div>
            <label
              htmlFor='setup-code'
              className='mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300'
            >
              Department setup code
            </label>

            <input
              id='setup-code'
              type='password'
              value={setupCode}
              onChange={(event) => setSetupCode(event.target.value)}
              placeholder='Enter setup code'
              autoFocus
              disabled={loading}
              className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
            />
          </div>

          <div className='rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400'>
            The department setup code is required because deleting a unit is a
            permanent administrative action.
          </div>
        </>
      )}

      {error && (
        <div className='rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400'>
          {error}
        </div>
      )}

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='secondary'
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        {!hasMembers && (
          <Button
            type='submit'
            disabled={loading || !setupCode.trim()}
            className='bg-red-600 hover:bg-red-700'
          >
            {loading ? 'Deleting...' : 'Delete unit'}
          </Button>
        )}
      </div>
    </form>
  );
}

function UnitCard({ unit, isMainAdmin, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  console.log(unit);

  const admins = unit.adminUsers || unit.admins || [];
  const memberCount = Number(unit.memberCount || 0);

  return (
    <Card className='relative'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'>
            <Users size={20} />
          </div>

          <div className='min-w-0'>
            <h2 className='truncate font-semibold text-zinc-900 dark:text-white'>
              {unit.name}
            </h2>

            <p className='mt-0.5 text-sm text-zinc-500 dark:text-zinc-400'>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        <div className='relative'>
          <button
            type='button'
            onClick={() => setOpen((current) => !current)}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
            aria-label={`Actions for ${unit.name}`}
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <>
              <div
                className='fixed inset-0 z-20'
                onClick={() => setOpen(false)}
                aria-hidden='true'
              />

              <div className='absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900'>
                <button
                  type='button'
                  onClick={() => {
                    setOpen(false);
                    onEdit(unit);
                  }}
                  className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
                >
                  <Pencil size={16} />
                  Edit unit
                </button>

                {isMainAdmin && (
                  <button
                    type='button'
                    onClick={() => {
                      setOpen(false);
                      onDelete(unit);
                    }}
                    className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                  >
                    <Trash2 size={16} />
                    Delete unit
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className='mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800'>
        <div className='flex items-start gap-2'>
          <Shield size={16} className='mt-0.5 shrink-0 text-zinc-400' />

          <div className='min-w-0'>
            <p className='text-xs text-zinc-500 dark:text-zinc-400'>
              Unit administrators
            </p>

            {admins.length === 0 ? (
              <p className='mt-1 text-sm text-zinc-400 dark:text-zinc-500'>
                No administrators assigned
              </p>
            ) : (
              <div className='mt-1 space-y-1'>
                {admins.map((admin) => (
                  <p
                    key={admin._id || admin.id}
                    className='truncate text-sm font-medium text-zinc-700 dark:text-zinc-300'
                  >
                    {admin.fullName || admin.email}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Units() {
  const { isMainAdmin } = useAuth();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getUnits();

      console.log('GET UNITS RESPONSE:', data);

      setUnits(Array.isArray(data?.units) ? data.units : []);
    } catch (err) {
      console.error('fetchUnits error:', err);

      setError(err.message || 'Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const openAddModal = () => {
    setActionError('');

    setModal({
      type: 'add',
    });
  };

  const openEditModal = (unit) => {
    setActionError('');

    setModal({
      type: 'edit',
      unit,
    });
  };

  const openDeleteModal = (unit) => {
    if (!isMainAdmin) {
      return;
    }

    setActionError('');

    setModal({
      type: 'delete',
      unit,
    });
  };

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setModal(null);
    setActionError('');
  };

  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      setActionError('');

      const response = await createUnit(data);

      if (!response?.unit) {
        throw new Error('The server did not return the created unit');
      }

      setUnits((current) =>
        [...current, response.unit].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setModal(null);
    } catch (err) {
      console.error('handleCreate error:', err);

      setActionError(err.message || 'Failed to create unit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!modal?.unit?._id) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');

      const response = await updateUnit(modal.unit._id, data);

      if (!response?.unit) {
        throw new Error('The server did not return the updated unit');
      }

      setUnits((current) =>
        current
          .map((unit) =>
            unit._id === response.unit._id ? response.unit : unit,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      setModal(null);
    } catch (err) {
      console.error('handleUpdate error:', err);

      setActionError(err.message || 'Failed to update unit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (setupCode) => {
    if (!modal?.unit?._id || !isMainAdmin) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');

      await deleteUnit(modal.unit._id, setupCode);

      setUnits((current) =>
        current.filter((unit) => unit._id !== modal.unit._id),
      );

      setModal(null);
    } catch (err) {
      console.error('handleDelete error:', err);

      setActionError(err.message || 'Failed to delete unit');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
            Units
          </h1>

          <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
            Manage the units within your department
          </p>
        </div>

        <Button onClick={openAddModal}>
          <Plus size={17} />
          Add unit
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchUnits} />
      ) : units.length === 0 ? (
        <EmptyState onAdd={openAddModal} />
      ) : (
        <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {units.map((unit) => (
            <UnitCard
              key={unit._id}
              unit={unit}
              isMainAdmin={isMainAdmin}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Add Unit Modal */}
      <Modal open={modal?.type === 'add'} onClose={closeModal} title='Add unit'>
        <UnitForm
          onSubmit={handleCreate}
          onCancel={closeModal}
          loading={actionLoading}
          error={actionError}
          submitLabel='Create unit'
        />
      </Modal>

      {/* Edit Unit Modal */}
      <Modal
        open={modal?.type === 'edit'}
        onClose={closeModal}
        title='Edit unit'
      >
        {modal?.unit && (
          <UnitForm
            key={modal.unit._id}
            initialName={modal.unit.name}
            onSubmit={handleUpdate}
            onCancel={closeModal}
            loading={actionLoading}
            error={actionError}
            submitLabel='Save changes'
          />
        )}
      </Modal>

      {/* Delete Unit Modal */}
      <Modal
        open={modal?.type === 'delete'}
        onClose={closeModal}
        title='Delete unit'
      >
        {modal?.unit && isMainAdmin && (
          <DeleteUnitForm
            key={modal.unit._id}
            unit={modal.unit}
            onSubmit={handleDelete}
            onCancel={closeModal}
            loading={actionLoading}
            error={actionError}
          />
        )}
      </Modal>
    </div>
  );
}
