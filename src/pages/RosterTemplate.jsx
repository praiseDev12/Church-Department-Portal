import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Edit3,
  Loader2,
  MapPin,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

import {
  deactivateRosterEvent,
  generateMonthlyRoster,
  getMonthlyRosterByTemplateMonth,
  getRosterEvents,
  getRosterTemplates,
  deleteRosterTemplate,
} from '../services/rosterService.js';

import Card from '../components/ui/Card.jsx';
import AppLoader from '../components/ui/AppLoader.jsx';
import Button from '../components/ui/Button.jsx';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}`;
};

const formatTime = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatSchedule = (duty) => {
  const day = DAYS[duty.dayOfWeek] || '';
  const start = formatTime(duty.startTime);

  if (!duty.endTime) {
    return `${day} · ${start}`;
  }

  return `${day} · ${start} - ${formatTime(duty.endTime)}`;
};

export default function RosterTemplate() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [template, setTemplate] = useState(null);
  const [month, setMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [existingRoster, setExistingRoster] = useState(null);
  const [checkingRoster, setCheckingRoster] = useState(false);

  const [deactivatingEventId, setDeactivatingEventId] = useState(null);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [scrollToEventId, setScrollToEventId] = useState(null);

  const [deleteTemplateModal, setDeleteTemplateModal] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(false);

  useEffect(() => {
    document.title = 'Roster Template';

    let mounted = true;

    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getRosterTemplates();

        const foundTemplate = response.templates?.find(
          (item) => item._id === templateId,
        );

        if (!foundTemplate) {
          throw new Error('Roster template not found.');
        }

        setTemplate(foundTemplate);
      } catch (err) {
        console.error('Load roster template error:', err);

        setError(err.message || 'Failed to load the roster template.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();

    async function loadEvents() {
      try {
        setLoadingEvents(true);

        const response = await getRosterEvents(templateId);

        if (!mounted) return;

        setEvents(response.events || []);
      } catch (err) {
        if (mounted) {
          console.error('Failed to load roster events:', err);
          setEvents([]);
        }
      } finally {
        if (mounted) {
          setLoadingEvents(false);
        }
      }
    }

    loadEvents();

    return () => {
      mounted = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (!scrollToEventId || loadingEvents) return;

    const eventElement = document.getElementById(
      `roster-event-${scrollToEventId}`,
    );

    if (!eventElement) return;

    eventElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    setScrollToEventId(null);
  }, [events, loadingEvents, scrollToEventId]);

  useEffect(() => {
    const createdEventId = location.state?.createdEventId;

    if (!createdEventId || loadingEvents) return;

    setScrollToEventId(createdEventId);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location, loadingEvents, navigate]);

  const handleGenerateRoster = async () => {
    try {
      setGenerating(true);
      setError('');

      const response = await generateMonthlyRoster(templateId, month);

      if (!response?.roster?._id) {
        throw new Error(
          'The roster was generated, but no roster ID was returned.',
        );
      }

      navigate(`/roster/${response.roster._id}`);
    } catch (err) {
      console.error('Generate monthly roster error:', err);

      setError(err.message || 'Failed to generate the monthly roster.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeactivateEvent = async (eventId) => {
    const confirmed = window.confirm(
      'Deactivate this program? It will no longer be included in future roster generation.',
    );

    if (!confirmed) return;

    try {
      setDeactivatingEventId(eventId);

      await deactivateRosterEvent(eventId);

      setEvents((current) => current.filter((event) => event._id !== eventId));
    } catch (err) {
      setError(err.message || 'Failed to deactivate the program.');
    } finally {
      setDeactivatingEventId(null);
    }
  };

  const openDeleteTemplateModal = () => {
    setDeleteTemplateModal(true);
  };

  const closeDeleteTemplateModal = () => {
    if (deletingTemplate) return;

    setDeleteTemplateModal(false);
  };

  const handleDeleteTemplate = async () => {
    try {
      setDeletingTemplate(true);
      setError('');

      await deleteRosterTemplate(templateId);

      navigate('/roster');
    } catch (err) {
      console.error('Delete roster template error:', err);

      setError(err.message || 'Failed to delete the roster template.');
    } finally {
      setDeletingTemplate(false);
      setDeleteTemplateModal(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function checkExistingRoster() {
      try {
        setCheckingRoster(true);

        const response = await getMonthlyRosterByTemplateMonth(
          templateId,
          month,
        );

        if (!mounted) return;

        setExistingRoster(response.roster || null);
      } catch (err) {
        if (mounted) {
          setExistingRoster(null);
        }
      } finally {
        if (mounted) {
          setCheckingRoster(false);
        }
      }
    }

    checkExistingRoster();

    return () => {
      mounted = false;
    };
  }, [templateId, month]);

  if (loading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <AppLoader />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className='space-y-6'>
        <Button
          type='button'
          variant='secondary'
          onClick={() => navigate('/roster')}
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Roster
        </Button>

        <Card>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400'>
            {error}
          </div>
        </Card>
      </div>
    );
  }

  const activeDuties =
    template?.duties?.filter((duty) => duty.active !== false) || [];

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row justify-between'>
        {/* Back */}
        <div className='flex items-center gap-5'>
          <Button
            type='button'
            variant='secondary'
            onClick={() => navigate('/roster')}
          >
            <ArrowLeft className='h-4 w-4' />
            Back
          </Button>
          <Button
            type='button'
            onClick={() => navigate(`/roster/template/${templateId}/edit`)}
          >
            <Edit3 className='h-4 w-4' />
            Edit Template
          </Button>

          <Button
            type='button'
            variant='outline'
            onClick={openDeleteTemplateModal}
            disabled={deletingTemplate}
            className='w-full text-red-500 hover:text-red-500 sm:w-auto'
          >
            <Trash2 className='h-4 w-4' />
            Delete Template
          </Button>
        </div>

        <Button
          type='button'
          onClick={() =>
            navigate(`/roster/template/${templateId}`, {
              state: {
                createdEventId: response.event._id,
              },
            })
          }
          className='w-full sm:w-auto'
        >
          <Plus className='h-4 w-4' />
          Add Program
        </Button>
      </div>

      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-semibold text-gray-900 dark:text-white'>
            {template.name}
          </h1>

          {template.description && (
            <p className='mt-1 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400'>
              {template.description}
            </p>
          )}
        </div>

        <span className='w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400'>
          Active
        </span>
      </div>
      {/* Monthly roster */}
      <Card>
        <div className='space-y-5'>
          <div>
            <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
              Monthly roster
            </h2>

            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Generate and review assignments for a specific month.
            </p>
          </div>

          {error && (
            <div
              className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400'
              role='alert'
            >
              {error}
            </div>
          )}

          <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
            <div className='w-full sm:max-w-xs'>
              <label
                htmlFor='roster-month'
                className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Month
              </label>

              <div className='relative'>
                <CalendarDays className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />

                <input
                  id='roster-month'
                  type='month'
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  disabled={generating}
                  className='w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white'
                />
              </div>
            </div>

            <Button
              type='button'
              onClick={async () => {
                if (existingRoster?._id) {
                  navigate(`/roster/${existingRoster._id}`);
                  return;
                }

                try {
                  setGenerating(true);
                  setError('');

                  const response = await generateMonthlyRoster(
                    templateId,
                    month,
                  );

                  if (!response.roster?._id) {
                    throw new Error(
                      'Roster was generated but no roster ID was returned.',
                    );
                  }

                  navigate(`/roster/${response.roster._id}`);
                } catch (err) {
                  setError(err.message || 'Failed to generate monthly roster.');
                } finally {
                  setGenerating(false);
                }
              }}
              disabled={generating || checkingRoster}
              className='w-full sm:w-auto'
            >
              {generating || checkingRoster ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {checkingRoster ? 'Checking...' : 'Generating...'}
                </>
              ) : existingRoster?._id ? (
                <>
                  <CalendarDays className='h-4 w-4' />
                  Open Draft
                </>
              ) : (
                <>
                  <CalendarDays className='h-4 w-4' />
                  Generate Monthly Roster
                </>
              )}
            </Button>
          </div>

          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Generated rosters start as drafts so you can review assignments
            before publishing them.
          </p>
        </div>
      </Card>
      {/* Recurring duties */}
      <div>
        <div className='mb-4'>
          <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
            Recurring duties
          </h2>

          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            These duties are automatically included when a monthly roster is
            generated.
          </p>
        </div>

        {activeDuties.length === 0 ? (
          <Card>
            <div className='py-8 text-center text-sm text-gray-500 dark:text-gray-400'>
              No active recurring duties.
            </div>
          </Card>
        ) : (
          <div className='space-y-4'>
            {activeDuties.map((duty) => (
              <Card key={duty._id}>
                <div className='space-y-5'>
                  {/* Duty heading */}
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <h3 className='font-display text-base font-semibold text-gray-900 dark:text-white'>
                        {duty.name}
                      </h3>

                      <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                        {formatSchedule(duty)}
                      </p>
                    </div>

                    <span className='w-fit rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'>
                      {duty.membersNeeded}{' '}
                      {duty.membersNeeded === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {/* Duty details */}
                  <div className='grid gap-3 sm:grid-cols-3'>
                    <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                      <Clock3 className='h-4 w-4 text-gray-400' />
                      <span>
                        {formatTime(duty.startTime)}
                        {duty.endTime ? ` - ${formatTime(duty.endTime)}` : ''}
                      </span>
                    </div>

                    <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                      <Users className='h-4 w-4 text-gray-400' />
                      <span>
                        {duty.membersNeeded}{' '}
                        {duty.membersNeeded === 1
                          ? 'person needed'
                          : 'people needed'}
                      </span>
                    </div>

                    <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                      <MapPin className='h-4 w-4 text-gray-400' />
                      <span>{duty.location || 'No location set'}</span>
                    </div>
                  </div>

                  {/* Roles */}
                  {duty.rolesEnabled && duty.roles?.length > 0 && (
                    <div className='border-t border-gray-100 pt-4 dark:border-gray-800'>
                      <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                        Roles
                      </p>

                      <div className='flex flex-wrap gap-2'>
                        {[...duty.roles]
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((role) => (
                            <span
                              key={role._id}
                              className='rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            >
                              {role.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
        <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='font-display text-lg font-semibold'>
              Special Programs
            </h2>

            <p className='mt-1 text-sm text-muted-foreground'>
              One-off and multi-day programs added to this roster.
            </p>
          </div>

          <Button
            type='button'
            onClick={() =>
              navigate(`/roster/template/${templateId}/event/create`)
            }
            className='w-full sm:w-auto'
          >
            <Plus className='h-4 w-4' />
            Add Program
          </Button>
        </div>

        {loadingEvents ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-5 w-5 animate-spin text-brand-500' />
          </div>
        ) : events.length === 0 ? (
          <div className='rounded-xl border border-dashed border-border px-4 py-8 text-center'>
            <CalendarDays className='mx-auto h-8 w-8 text-muted-foreground' />

            <p className='mt-3 text-sm font-medium'>No special programs yet</p>

            <p className='mt-1 text-xs text-muted-foreground'>
              Add a one-off or multi-day program when your unit needs additional
              coverage.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {events.map((event) => (
              <div
                id={`roster-event-${event._id}`}
                key={event._id}
                className='rounded-xl border border-border bg-background p-4'
              >
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0'>
                    <h3 className='font-semibold'>{event.name}</h3>
                    {event.description && (
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {event.description}
                      </p>
                    )}

                    <div className='flex shrink-0 flex-wrap items-center gap-2'>
                      <span className='inline-flex rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-500'>
                        {event.rolesEnabled
                          ? `${event.roles?.length || 0} role${
                              event.roles?.length === 1 ? '' : 's'
                            }`
                          : 'Roles disabled'}
                      </span>

                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          navigate(
                            `/roster/template/${templateId}/event/${event._id}/edit`,
                          )
                        }
                      >
                        <Edit3 className='h-3.5 w-3.5' />
                        Edit
                      </Button>

                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeactivateEvent(event._id)}
                        disabled={deactivatingEventId === event._id}
                        className='text-red-500 hover:text-red-500'
                      >
                        {deactivatingEventId === event._id ? (
                          <Loader2 className='h-3.5 w-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='h-3.5 w-3.5' />
                        )}
                        Deactivate
                      </Button>
                    </div>
                  </div>

                  <div className='shrink-0'>
                    <span className='inline-flex rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-500'>
                      {event.rolesEnabled
                        ? `${event.roles?.length || 0} role${
                            event.roles?.length === 1 ? '' : 's'
                          }`
                        : 'Roles disabled'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteTemplateModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div
            className='w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900'
            role='dialog'
            aria-modal='true'
            aria-labelledby='delete-template-modal-title'
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                  <AlertTriangle className='h-5 w-5' />
                </div>

                <div>
                  <h2
                    id='delete-template-modal-title'
                    className='font-display text-lg font-semibold text-gray-900 dark:text-white'
                  >
                    Delete roster template?
                  </h2>

                  <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    This will permanently delete{' '}
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      {template?.name || 'this roster template'}
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type='button'
                onClick={closeDeleteTemplateModal}
                disabled={deletingTemplate}
                className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800'
                aria-label='Close'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <Button
                type='button'
                variant='secondary'
                onClick={closeDeleteTemplateModal}
                disabled={deletingTemplate}
              >
                Cancel
              </Button>

              <Button
                type='button'
                onClick={handleDeleteTemplate}
                disabled={deletingTemplate}
                className='bg-red-600 text-white hover:bg-red-700'
              >
                {deletingTemplate ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='mr-2 h-4 w-4' />
                )}

                {deletingTemplate ? 'Deleting...' : 'Delete Template'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
