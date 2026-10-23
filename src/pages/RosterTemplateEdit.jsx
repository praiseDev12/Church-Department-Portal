import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock3,
  Plus,
  Save,
  Trash2,
  UserRoundCog,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import FormSelect from '../components/ui/FormSelect.jsx';
import AppLoader from '../components/ui/AppLoader.jsx';

import {
  getRosterTemplates,
  updateRosterTemplate,
} from '../services/rosterService.js';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const createEmptyDuty = () => ({
  name: '',
  dayOfWeek: 0,
  startTime: '08:00',
  endTime: '12:00',
  membersNeeded: 1,
  rolesEnabled: true,
  roles: [],
  location: '',
  active: true,
});

const createDefaultSettings = () => ({
  avoidOverlappingAssignments: true,
  balanceAssignments: true,
  rotateRoles: true,
});

const normalizeDuty = (duty) => ({
  _id: duty._id,
  name: duty.name || '',
  dayOfWeek: Number(duty.dayOfWeek ?? 0),
  startTime: duty.startTime || '08:00',
  endTime: duty.endTime || '12:00',
  membersNeeded: Number(duty.membersNeeded || 1),
  rolesEnabled: duty.rolesEnabled !== false,
  roles: (duty.roles || []).map((role, index) => ({
    _id: role._id,
    name: role.name || '',
    order: index,
  })),
  location: duty.location || '',
  active: duty.active !== false,
});

export default function RosterTemplateEdit() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duties, setDuties] = useState([]);
  const [settings, setSettings] = useState(createDefaultSettings());

  const [scrollToDutyIndex, setScrollToDutyIndex] = useState(null);

  useEffect(() => {
    document.title = 'Edit Roster';

    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getRosterTemplates();

        const template = (response.templates || []).find(
          (item) => item._id === templateId,
        );

        if (!template) {
          throw new Error('Roster template not found.');
        }

        setName(template.name || '');
        setDescription(template.description || '');

        setDuties((template.duties || []).map(normalizeDuty));

        setSettings({
          avoidOverlappingAssignments:
            template.settings?.avoidOverlappingAssignments !== false,
          balanceAssignments: template.settings?.balanceAssignments !== false,
          rotateRoles: template.settings?.rotateRoles !== false,
        });
      } catch (err) {
        console.error('Load roster template error:', err);
        setError(err.message || 'Failed to load roster template.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  const updateDuty = (index, field, value) => {
    setDuties((current) =>
      current.map((duty, dutyIndex) =>
        dutyIndex === index
          ? {
              ...duty,
              [field]: value,
            }
          : duty,
      ),
    );
  };

  const addDuty = () => {
    setDuties((current) => {
      const newIndex = current.length;

      setScrollToDutyIndex(newIndex);

      return [...current, createEmptyDuty()];
    });
  };

  useEffect(() => {
    if (scrollToDutyIndex === null) return;

    const dutyElement = document.getElementById(
      `roster-duty-${scrollToDutyIndex}`,
    );

    if (!dutyElement) return;

    dutyElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    setScrollToDutyIndex(null);
  }, [duties, scrollToDutyIndex]);

  const removeDuty = (index) => {
    setDuties((current) =>
      current.filter((_, dutyIndex) => dutyIndex !== index),
    );
  };

  const toggleRoles = (index) => {
    setDuties((current) =>
      current.map((duty, dutyIndex) =>
        dutyIndex === index
          ? {
              ...duty,
              rolesEnabled: !duty.rolesEnabled,
            }
          : duty,
      ),
    );
  };

  const addRole = (dutyIndex) => {
    setDuties((current) =>
      current.map((duty, index) => {
        if (index !== dutyIndex) return duty;

        return {
          ...duty,
          roles: [
            ...duty.roles,
            {
              name: 'New Role',
              order: duty.roles.length,
            },
          ],
        };
      }),
    );
  };

  const addDefaultRoles = (dutyIndex) => {
    const defaultRoles = [
      'Projection Operator',
      'Slides Operator',
      'Backup Operator',
    ];

    setDuties((current) =>
      current.map((duty, index) => {
        if (index !== dutyIndex) return duty;

        const existingNames = new Set(
          duty.roles.map((role) => role.name.trim().toLowerCase()),
        );

        const newRoles = defaultRoles
          .filter((roleName) => !existingNames.has(roleName.toLowerCase()))
          .map((roleName, roleIndex) => ({
            name: roleName,
            order: duty.roles.length + roleIndex,
          }));

        return {
          ...duty,
          roles: [...duty.roles, ...newRoles],
        };
      }),
    );
  };

  const updateRole = (dutyIndex, roleIndex, value) => {
    setDuties((current) =>
      current.map((duty, index) => {
        if (index !== dutyIndex) return duty;

        return {
          ...duty,
          roles: duty.roles.map((role, currentRoleIndex) =>
            currentRoleIndex === roleIndex
              ? {
                  ...role,
                  name: value,
                }
              : role,
          ),
        };
      }),
    );
  };

  const removeRole = (dutyIndex, roleIndex) => {
    setDuties((current) =>
      current.map((duty, index) => {
        if (index !== dutyIndex) return duty;

        return {
          ...duty,
          roles: duty.roles
            .filter((_, currentRoleIndex) => currentRoleIndex !== roleIndex)
            .map((role, currentRoleIndex) => ({
              ...role,
              order: currentRoleIndex,
            })),
        };
      }),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!name.trim()) {
      setError('Please enter a roster name.');
      return;
    }

    if (duties.length === 0) {
      setError('Please add at least one recurring duty.');
      return;
    }

    for (let index = 0; index < duties.length; index += 1) {
      const duty = duties[index];

      if (!duty.name.trim()) {
        setError(`Please enter a name for duty ${index + 1}.`);
        return;
      }

      if (!duty.startTime) {
        setError(`Please enter a start time for duty ${index + 1}.`);
        return;
      }

      if (duty.endTime && duty.endTime <= duty.startTime) {
        setError(
          `The end time must be later than the start time for duty ${index + 1}.`,
        );
        return;
      }

      if (Number(duty.membersNeeded) < 1) {
        setError(`Duty ${index + 1} must require at least one member.`);
        return;
      }

      if (duty.rolesEnabled) {
        const invalidRole = duty.roles.some((role) => !role.name.trim());

        if (invalidRole) {
          setError(
            `Please complete or remove empty roles in duty ${index + 1}.`,
          );
          return;
        }
      }
    }

    try {
      setSaving(true);

      const response = await updateRosterTemplate(templateId, {
        name: name.trim(),
        description: description.trim(),

        duties: duties.map((duty) => ({
          ...(duty._id ? { _id: duty._id } : {}),
          name: duty.name.trim(),
          dayOfWeek: Number(duty.dayOfWeek),
          startTime: duty.startTime,
          endTime: duty.endTime || null,
          membersNeeded: Number(duty.membersNeeded),
          rolesEnabled: Boolean(duty.rolesEnabled),

          roles: duty.rolesEnabled
            ? duty.roles.map((role, index) => ({
                ...(role._id ? { _id: role._id } : {}),
                name: role.name.trim(),
                order: index,
              }))
            : [],

          location: duty.location.trim(),
          active: duty.active !== false,
        })),

        settings,
      });

      if (!response?.template?._id) {
        throw new Error('Roster was updated, but no template was returned.');
      }

      navigate(`/roster/template/${templateId}`);
    } catch (err) {
      console.error('Update roster template error:', err);
      setError(err.message || 'Failed to update roster.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <AppLoader />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <Button
          type='button'
          variant='secondary'
          onClick={() => navigate(`/roster/template/${templateId}`)}
          className='w-full sm:w-auto'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>

        <div>
          <h1 className='font-display text-2xl font-semibold text-gray-900 dark:text-white'>
            Edit Roster
          </h1>

          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Update your recurring roster schedule.
          </p>
        </div>
      </div>

      {error && (
        <Card>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400'>
            {error}
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic information */}
        <Card>
          <div className='space-y-5'>
            <div>
              <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
                Basic information
              </h2>

              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Update the roster name and description.
              </p>
            </div>

            <div className='space-y-4'>
              <FormInput
                label='Roster name'
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder='e.g. Technical Unit Roster'
                required
              />

              <div>
                <label
                  htmlFor='roster-description'
                  className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Description
                </label>

                <textarea
                  id='roster-description'
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className='block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Recurring duties */}
        <Card>
          <div className='space-y-5'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
                  Recurring duties
                </h2>

                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Update the regular duties in this roster.
                </p>
              </div>

              <Button
                type='button'
                variant='secondary'
                onClick={addDuty}
                className='w-full sm:w-auto'
              >
                <Plus className='h-4 w-4' />
                Add duty
              </Button>
            </div>

            <div className='space-y-4'>
              {duties.map((duty, index) => (
                <div
                  id={`roster-duty-${index}`}
                  key={duty._id || index}
                  className='rounded-xl border border-gray-200 p-4 dark:border-gray-800'
                >
                  <div className='mb-4 flex items-start justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
                        <Clock3 className='h-4 w-4' />
                      </div>

                      <div>
                        <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                          Duty {index + 1}
                        </h3>

                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Recurring weekly schedule
                        </p>
                      </div>
                    </div>

                    {duties.length > 1 && (
                      <button
                        type='button'
                        onClick={() => removeDuty(index)}
                        className='rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400'
                        aria-label={`Remove duty ${index + 1}`}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    )}
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <FormInput
                      label='Duty name'
                      value={duty.name}
                      onChange={(event) =>
                        updateDuty(index, 'name', event.target.value)
                      }
                      required
                    />

                    <FormSelect
                      label='Day'
                      value={duty.dayOfWeek}
                      onChange={(event) =>
                        updateDuty(
                          index,
                          'dayOfWeek',
                          Number(event.target.value),
                        )
                      }
                      options={DAYS.map((day, dayIndex) => ({
                        value: dayIndex,
                        label: day,
                      }))}
                    />

                    <FormInput
                      label='Start time'
                      type='time'
                      value={duty.startTime}
                      onChange={(event) =>
                        updateDuty(index, 'startTime', event.target.value)
                      }
                      required
                    />

                    <FormInput
                      label='End time'
                      type='time'
                      value={duty.endTime}
                      onChange={(event) =>
                        updateDuty(index, 'endTime', event.target.value)
                      }
                    />

                    <FormInput
                      label='Members needed'
                      type='number'
                      min='1'
                      value={duty.membersNeeded}
                      onChange={(event) =>
                        updateDuty(
                          index,
                          'membersNeeded',
                          Math.max(1, Number(event.target.value)),
                        )
                      }
                      required
                    />

                    <FormInput
                      label='Location'
                      value={duty.location}
                      onChange={(event) =>
                        updateDuty(index, 'location', event.target.value)
                      }
                    />
                  </div>

                  {/* Roles */}
                  <div className='mt-5 border-t border-gray-100 pt-5 dark:border-gray-800'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                      <div className='flex gap-3'>
                        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                          <UserRoundCog className='h-4 w-4' />
                        </div>

                        <div>
                          <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                            Roles
                          </p>

                          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            Assign specific responsibilities to members.
                          </p>
                        </div>
                      </div>

                      <label className='flex cursor-pointer items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={duty.rolesEnabled}
                          onChange={() => toggleRoles(index)}
                          className='h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900'
                        />

                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          Enable roles
                        </span>
                      </label>
                    </div>

                    {duty.rolesEnabled && (
                      <div className='mt-4 space-y-3'>
                        {duty.roles.map((role, roleIndex) => (
                          <div
                            key={role._id || roleIndex}
                            className='flex items-end gap-2'
                          >
                            <div className='min-w-0 flex-1'>
                              <FormInput
                                label={`Role ${roleIndex + 1}`}
                                value={role.name}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    roleIndex,
                                    event.target.value,
                                  )
                                }
                              />
                            </div>

                            <button
                              type='button'
                              onClick={() => removeRole(index, roleIndex)}
                              className='mb-0.5 rounded-lg p-2.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400'
                              aria-label={`Remove role ${roleIndex + 1}`}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        ))}

                        <div className='flex flex-col gap-2 sm:flex-row'>
                          <Button
                            type='button'
                            variant='secondary'
                            onClick={() => addRole(index)}
                          >
                            <Plus className='h-4 w-4' />
                            Add role
                          </Button>

                          <Button
                            type='button'
                            variant='secondary'
                            onClick={() => addDefaultRoles(index)}
                          >
                            Add default roles
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Roster settings */}
        <Card>
          <div className='space-y-5'>
            <div>
              <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
                Roster settings
              </h2>

              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Choose how members should be assigned when monthly rosters are
                generated.
              </p>
            </div>

            <div className='space-y-3'>
              <label className='flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
                <input
                  type='checkbox'
                  checked={settings.avoidOverlappingAssignments}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      avoidOverlappingAssignments: event.target.checked,
                    }))
                  }
                  className='mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900'
                />

                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    Avoid overlapping assignments
                  </p>

                  <p className='mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400'>
                    Prevent the same member from being assigned to overlapping
                    duties.
                  </p>
                </div>
              </label>

              <label className='flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
                <input
                  type='checkbox'
                  checked={settings.balanceAssignments}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      balanceAssignments: event.target.checked,
                    }))
                  }
                  className='mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900'
                />

                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    Balance assignments
                  </p>

                  <p className='mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400'>
                    Spread duties fairly across available members.
                  </p>
                </div>
              </label>

              <label className='flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
                <input
                  type='checkbox'
                  checked={settings.rotateRoles}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      rotateRoles: event.target.checked,
                    }))
                  }
                  className='mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900'
                />

                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    Rotate roles
                  </p>

                  <p className='mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400'>
                    Rotate members between roles across assignments.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='secondary'
            onClick={() => navigate(`/roster/template/${templateId}`)}
            disabled={saving}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>

          <Button type='submit' disabled={saving} className='w-full sm:w-auto'>
            <Save className='h-4 w-4' />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
