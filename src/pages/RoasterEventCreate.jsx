import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';

import Button from '../components/ui/button.jsx';
import {
  createRosterEvent,
  getRosterTemplates,
} from '../services/rosterService.js';

const defaultRoles = [
  'Projection Operator',
  'Slides Operator',
  'Backup Operator',
];

const emptyRole = () => ({
  name: '',
});

function RosterEventCreate() {
  const navigate = useNavigate();
  const { templateId } = useParams();

  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    membersNeeded: 1,
    rolesEnabled: true,
    roles: [],
  });

  useEffect(() => {
    let mounted = true;

    async function loadTemplate() {
      try {
        setLoadingTemplate(true);
        setError('');

        const response = await getRosterTemplates();

        if (!mounted) return;

        const foundTemplate = response.templates?.find(
          (item) => item._id === templateId,
        );

        if (!foundTemplate) {
          throw new Error('Roster template not found.');
        }

        setTemplate(foundTemplate);
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load roster template.');
        }
      } finally {
        if (mounted) {
          setLoadingTemplate(false);
        }
      }
    }

    loadTemplate();

    return () => {
      mounted = false;
    };
  }, [templateId]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addRole = () => {
    setForm((current) => ({
      ...current,
      roles: [...current.roles, emptyRole()],
    }));
  };

  const addDefaultRoles = () => {
    setForm((current) => ({
      ...current,
      roles: defaultRoles.map((name) => ({ name })),
    }));
  };

  const updateRole = (index, value) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.map((role, roleIndex) =>
        roleIndex === index
          ? {
              ...role,
              name: value,
            }
          : role,
      ),
    }));
  };

  const removeRole = (index) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.filter((_, roleIndex) => roleIndex !== index),
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      return 'Program name is required.';
    }

    if (!form.startDate) {
      return 'Start date is required.';
    }

    if (!form.endDate) {
      return 'End date is required.';
    }

    if (form.endDate < form.startDate) {
      return 'End date cannot be before the start date.';
    }

    if (!form.startTime) {
      return 'Start time is required.';
    }

    if (form.endTime && form.endTime <= form.startTime) {
      return 'End time must be later than the start time.';
    }

    const membersNeeded = Number(form.membersNeeded);

    if (!Number.isInteger(membersNeeded) || membersNeeded < 1) {
      return 'Members needed must be at least 1.';
    }

    if (form.rolesEnabled) {
      const validRoles = form.roles.filter((role) => role.name.trim());

      if (validRoles.length > membersNeeded) {
        return 'You cannot have more roles than members needed.';
      }
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await createRosterEvent({
        templateId,
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime || null,
        location: form.location.trim(),
        membersNeeded: Number(form.membersNeeded),
        rolesEnabled: Boolean(form.rolesEnabled),
        roles: form.rolesEnabled
          ? form.roles
              .filter((role) => role.name.trim())
              .map((role, index) => ({
                name: role.name.trim(),
                order: index,
              }))
          : [],
      });

      const createdEvent = response.event || response.rosterEvent;

      if (!createdEvent) {
        throw new Error(
          'Program was created, but the server returned no program.',
        );
      }

      navigate(`/roster/template/${templateId}`);
    } catch (err) {
      setError(err.message || 'Failed to create program.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingTemplate) {
    return (
      <div className='flex min-h-75 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-brand-500' />
      </div>
    );
  }

  if (!template) {
    return (
      <div className='space-y-4'>
        <Button
          type='button'
          variant='ghost'
          onClick={() => navigate(`/roster/template/${templateId}`)}
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>

        <div className='rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500'>
          {error || 'Roster template not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-4xl space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <Button
            type='button'
            variant='ghost'
            onClick={() => navigate(`/roster/template/${templateId}`)}
            className='mb-3 px-0'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Template
          </Button>

          <h1 className='font-display text-2xl font-semibold'>Add Program</h1>

          <p className='mt-1 text-sm text-muted-foreground'>
            Add a one-off or multi-day program to this roster template.
          </p>
        </div>
      </div>

      {error && (
        <div className='rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
          <div className='mb-5'>
            <h2 className='font-display text-lg font-semibold'>
              Program Details
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              This program will belong to{' '}
              <span className='font-medium text-foreground'>
                {template.name}
              </span>
              .
            </p>
          </div>

          <div className='space-y-5'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Program Name
              </label>

              <input
                type='text'
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder='e.g. Technical Conference'
                className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                placeholder='Describe the program...'
                rows={3}
                className='w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500'
              />
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-start gap-3'>
            <div className='rounded-lg bg-brand-500/10 p-2 text-brand-500'>
              <CalendarDays className='h-5 w-5' />
            </div>

            <div>
              <h2 className='font-display text-lg font-semibold'>Schedule</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                Use the same date for a one-day program or different dates for a
                multi-day program.
              </p>
            </div>
          </div>

          <div className='grid gap-5 sm:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Start Date
              </label>

              <input
                type='date'
                value={form.startDate}
                onChange={(event) =>
                  updateField('startDate', event.target.value)
                }
                className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>End Date</label>

              <input
                type='date'
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(event) => updateField('endDate', event.target.value)}
                className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Start Time
              </label>

              <div className='relative'>
                <Clock3 className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />

                <input
                  type='time'
                  value={form.startTime}
                  onChange={(event) =>
                    updateField('startTime', event.target.value)
                  }
                  className='w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500'
                />
              </div>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>End Time</label>

              <div className='relative'>
                <Clock3 className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />

                <input
                  type='time'
                  value={form.endTime}
                  min={form.startTime || undefined}
                  onChange={(event) =>
                    updateField('endTime', event.target.value)
                  }
                  className='w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-start gap-3'>
            <div className='rounded-lg bg-brand-500/10 p-2 text-brand-500'>
              <MapPin className='h-5 w-5' />
            </div>

            <div>
              <h2 className='font-display text-lg font-semibold'>Location</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                Where will this program take place?
              </p>
            </div>
          </div>

          <input
            type='text'
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
            placeholder='e.g. Main Auditorium'
            className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500'
          />
        </div>

        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
          <div className='mb-5 flex items-start gap-3'>
            <div className='rounded-lg bg-brand-500/10 p-2 text-brand-500'>
              <Users className='h-5 w-5' />
            </div>

            <div>
              <h2 className='font-display text-lg font-semibold'>Staffing</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                Choose how many members are required for each day of the
                program.
              </p>
            </div>
          </div>

          <div className='space-y-5'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Members Needed
              </label>

              <input
                type='number'
                min='1'
                step='1'
                value={form.membersNeeded}
                onChange={(event) =>
                  updateField('membersNeeded', event.target.value)
                }
                className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500'
              />
            </div>

            <div className='rounded-xl border border-border bg-background/50 p-4'>
              <label className='flex cursor-pointer items-start gap-3'>
                <input
                  type='checkbox'
                  checked={form.rolesEnabled}
                  onChange={(event) =>
                    updateField('rolesEnabled', event.target.checked)
                  }
                  className='mt-1 h-4 w-4 accent-brand-500'
                />

                <span>
                  <span className='block text-sm font-medium'>
                    Enable roles
                  </span>
                  <span className='mt-1 block text-xs text-muted-foreground'>
                    Assign specific responsibilities to members during this
                    program.
                  </span>
                </span>
              </label>
            </div>

            {form.rolesEnabled && (
              <div className='space-y-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h3 className='text-sm font-semibold'>Program Roles</h3>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Roles are assigned across the members needed for each
                      occurrence.
                    </p>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={addDefaultRoles}
                    >
                      Use Default Roles
                    </Button>

                    <Button type='button' variant='outline' onClick={addRole}>
                      <Plus className='h-4 w-4' />
                      Add Role
                    </Button>
                  </div>
                </div>

                {form.roles.length > 0 && (
                  <div className='space-y-3'>
                    {form.roles.map((role, index) => (
                      <div
                        key={`role-${index}`}
                        className='flex items-center gap-3'
                      >
                        <input
                          type='text'
                          value={role.name}
                          onChange={(event) =>
                            updateRole(index, event.target.value)
                          }
                          placeholder='e.g. Projection Operator'
                          className='flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500'
                        />

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => removeRole(index)}
                          aria-label='Remove role'
                        >
                          <Trash2 className='h-4 w-4 text-red-500' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate(`/roster/template/${templateId}`)}
            disabled={saving}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>

          <Button type='submit' disabled={saving} className='w-full sm:w-auto'>
            {saving ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <Plus className='h-4 w-4' />
                Create Program
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RosterEventCreate;
