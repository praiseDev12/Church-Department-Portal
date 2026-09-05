import { useEffect, useState } from 'react';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormInput from '../components/ui/FormInput.jsx';
import FormSelect from '../components/ui/FormSelect.jsx';

import {
  activateService,
  createService,
  generateCheckInCode,
  getServices,
  getTodaySessions,
  handleDeleteService,
  updateService,
} from '../services/checkInService.js';

const dayOptions = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

function formatDay(day) {
  return (
    dayOptions.find((item) => Number(item.value) === Number(day))?.label || ''
  );
}

function formatTime(time) {
  if (!time) return '';

  const [hours, minutes] = time.split(':');

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSessionStatus(session) {
  const now = new Date();

  if (!session) return 'not_started';

  const opensAt = new Date(session.opensAt);
  const closesAt = new Date(session.closesAt);

  if (now < opensAt) return 'not_started';
  if (now > closesAt) return 'closed';

  return 'open';
}

function getStatusLabel(status) {
  switch (status) {
    case 'open':
      return 'Open';

    case 'closed':
      return 'Closed';

    default:
      return 'Not open';
  }
}

function getStatusTone(status) {
  switch (status) {
    case 'open':
      return 'good';

    case 'closed':
      return 'critical';

    default:
      return 'neutral';
  }
}

const emptyForm = {
  name: '',
  dayOfWeek: '',
  startTime: '',
  openBeforeMinutes: 60,
  closeAfterMinutes: 60,
  graceMinutes: 15,
};

export default function HandleCheckIn() {
  const [services, setServices] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [error, setError] = useState('');
  const [sessionError, setSessionError] = useState('');

  const [generatingId, setGeneratingId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState('');

  const [deletingId, setDeletingId] = useState(null);

  function openCreateModal() {
    setEditingService(null);
    setForm(emptyForm);
    setServiceError('');
    setShowServiceModal(true);
  }

  function openEditModal(service) {
    setEditingService(service);

    setForm({
      name: service.name || '',
      dayOfWeek: String(service.dayOfWeek ?? ''),
      startTime: service.startTime || '',
      openBeforeMinutes: service.openBeforeMinutes ?? 60,
      closeAfterMinutes: service.closeAfterMinutes ?? 60,
      graceMinutes: service.graceMinutes ?? 15,
    });

    setServiceError('');
    setShowServiceModal(true);
  }

  function handleFormChange(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function loadServices() {
    try {
      setError('');

      const data = await getServices();

      setServices(data.services || []);
    } catch (err) {
      setError(err.message || 'Unable to load services.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSessions() {
    try {
      setSessionError('');

      const data = await getTodaySessions();

      setSessions(data.sessions || []);
    } catch (err) {
      setSessionError(err.message || 'Unable to load today’s sessions.');
    } finally {
      setSessionLoading(false);
    }
  }

  async function generateCode(serviceId) {
    try {
      setGeneratingId(serviceId);
      setError('');

      const data = await generateCheckInCode(serviceId);
      const session = data.session;

      setSelectedSession(session);

      await loadSessions();
    } catch (err) {
      setError(err.message || 'Unable to generate check-in code.');
    } finally {
      setGeneratingId(null);
    }
  }

  async function saveService(event) {
    event.preventDefault();

    setServiceError('');
    setSavingService(true);

    try {
      const payload = {
        name: form.name.trim(),
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        openBeforeMinutes: Number(form.openBeforeMinutes),
        closeAfterMinutes: Number(form.closeAfterMinutes),
        graceMinutes: Number(form.graceMinutes),
      };

      if (!payload.name) {
        throw new Error('Service name is required.');
      }

      if (form.dayOfWeek === '') {
        throw new Error('Select a day of the week.');
      }

      if (!editingService) {
        await createService(payload);
      } else {
        await updateService(editingService._id, payload);
      }

      setShowServiceModal(false);
      setEditingService(null);
      setForm(emptyForm);

      await loadServices();
    } catch (err) {
      setServiceError(err.message || 'Unable to save service.');
    } finally {
      setSavingService(false);
    }
  }

  async function deleteService(service) {
    const confirmed = window.confirm(
      `Deactivate "${service.name}"? You can activate it again later.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(service._id);
      setError('');

      await handleDeleteService(service._id);

      await loadServices();
      await loadSessions();

      if (selectedSession?.service?._id === service._id) {
        setSelectedSession(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to deactivate service.');
    } finally {
      setDeletingId(null);
    }
  }

  async function activate(service) {
    const confirmed = window.confirm(`Activate "${service.name}"?`);

    if (!confirmed) return;

    try {
      setDeletingId(service._id);
      setError('');

      await activateService(service._id);

      await loadServices();
      await loadSessions();
    } catch (err) {
      setError(err.message || 'Unable to activate service.');
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadServices();
    loadSessions();
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
            Service Check-In
          </h1>

          <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
            Manage service schedules and generate today’s attendance codes
          </p>
        </div>

        <Button onClick={openCreateModal}>Add service</Button>
      </div>

      {/* Global error */}
      {error && (
        <div className='rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400'>
          {error}
        </div>
      )}

      {/* Generated code */}
      {selectedSession && (
        <Card>
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
                  Current check-in code
                </p>

                <h2 className='text-lg font-semibold text-zinc-900 dark:text-white'>
                  {selectedSession.service?.name || 'Service'}
                </h2>
              </div>

              <Badge tone={getStatusTone(getSessionStatus(selectedSession))}>
                {getStatusLabel(getSessionStatus(selectedSession))}
              </Badge>
            </div>

            <div className='rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-6 text-center dark:border-zinc-700 dark:bg-zinc-900'>
              <p className='mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400'>
                Check-in code
              </p>

              <p className='font-mono text-5xl font-bold tracking-[0.3em] text-zinc-900 dark:text-white'>
                {selectedSession.code}
              </p>
            </div>

            <div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-3'>
              <div>
                <p className='text-zinc-500 dark:text-zinc-400'>Opens</p>

                <p className='font-medium text-zinc-900 dark:text-white'>
                  {formatDateTime(selectedSession.opensAt)}
                </p>
              </div>

              <div>
                <p className='text-zinc-500 dark:text-zinc-400'>
                  Scheduled start
                </p>

                <p className='font-medium text-zinc-900 dark:text-white'>
                  {formatDateTime(selectedSession.scheduledStart)}
                </p>
              </div>

              <div>
                <p className='text-zinc-500 dark:text-zinc-400'>Closes</p>

                <p className='font-medium text-zinc-900 dark:text-white'>
                  {formatDateTime(selectedSession.closesAt)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Today's sessions */}
      <section>
        <div className='mb-3 flex items-center justify-between'>
          <div>
            <h2 className='font-display text-lg font-semibold text-zinc-900 dark:text-white'>
              Today’s check-in sessions
            </h2>

            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Sessions that have been generated for today
            </p>
          </div>
        </div>

        {sessionError && (
          <div className='mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400'>
            {sessionError}
          </div>
        )}

        {sessionLoading ? (
          <Card>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Loading today’s sessions...
            </p>
          </Card>
        ) : sessions.length === 0 ? (
          <Card>
            <div className='py-4 text-center'>
              <p className='font-medium text-zinc-900 dark:text-white'>
                No check-in sessions generated yet
              </p>

              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Generate a code from a service below when the service is
                scheduled for today
              </p>
            </div>
          </Card>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {sessions.map((session) => {
              const status = getSessionStatus(session);

              return (
                <Card key={session._id}>
                  <div className='flex h-full flex-col gap-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <h3 className='font-semibold text-zinc-900 dark:text-white'>
                          {session.service?.name || 'Service'}
                        </h3>

                        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                          {formatDay(session.service?.dayOfWeek)}
                        </p>
                      </div>

                      <Badge tone={getStatusTone(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                    </div>

                    <div className='rounded-lg bg-zinc-50 px-3 py-4 text-center dark:bg-zinc-900'>
                      <p className='font-mono text-3xl font-bold tracking-[0.25em] text-zinc-900 dark:text-white'>
                        {session.code}
                      </p>
                    </div>

                    <div className='text-sm'>
                      <p className='text-zinc-500 dark:text-zinc-400'>
                        Service starts
                      </p>

                      <p className='font-medium text-zinc-900 dark:text-white'>
                        {formatDateTime(session.scheduledStart)}
                      </p>
                    </div>

                    <Button
                      variant='secondary'
                      onClick={() => setSelectedSession(session)}
                    >
                      View code
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Service schedules */}
      <section>
        <div className='mb-3'>
          <h2 className='font-display text-lg font-semibold text-zinc-900 dark:text-white'>
            Service schedules
          </h2>

          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            Configure when members can check in
          </p>
        </div>

        {loading ? (
          <Card>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Loading services...
            </p>
          </Card>
        ) : services.length === 0 ? (
          <Card>
            <div className='py-6 text-center'>
              <p className='font-medium text-zinc-900 dark:text-white'>
                No services configured
              </p>

              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Add your first service schedule to start using check-in
              </p>
            </div>
          </Card>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {services.map((service) => {
              const session = sessions.find(
                (item) =>
                  item.service?._id === service._id ||
                  item.service === service._id,
              );

              const isProcessing = deletingId === service._id;

              return (
                <Card key={service._id}>
                  <div className='flex h-full flex-col'>
                    {/* Service heading */}
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <h3 className='font-semibold text-zinc-900 dark:text-white'>
                          {service.name}
                        </h3>

                        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                          {formatDay(service.dayOfWeek)} at{' '}
                          {formatTime(service.startTime)}
                        </p>
                      </div>

                      <Badge tone={service.active ? 'good' : 'neutral'}>
                        {service.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Schedule information */}
                    <div className='mt-5 grid grid-cols-3 gap-2'>
                      <div className='rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900'>
                        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                          Opens
                        </p>

                        <p className='mt-1 text-sm font-semibold text-zinc-900 dark:text-white'>
                          {service.openBeforeMinutes}m
                        </p>
                      </div>

                      <div className='rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900'>
                        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                          Closes
                        </p>

                        <p className='mt-1 text-sm font-semibold text-zinc-900 dark:text-white'>
                          +{service.closeAfterMinutes}m
                        </p>
                      </div>

                      <div className='rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900'>
                        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                          Grace
                        </p>

                        <p className='mt-1 text-sm font-semibold text-zinc-900 dark:text-white'>
                          {service.graceMinutes}m
                        </p>
                      </div>
                    </div>

                    {/* Service actions */}
                    <div className='mt-5 flex flex-1 flex-col justify-end gap-2'>
                      {/* Generate/View code only for active services */}
                      {service.active &&
                        (session ? (
                          <Button onClick={() => setSelectedSession(session)}>
                            View today’s code
                          </Button>
                        ) : (
                          <Button
                            onClick={() => generateCode(service._id)}
                            disabled={generatingId === service._id}
                          >
                            {generatingId === service._id
                              ? 'Generating...'
                              : 'Generate today’s code'}
                          </Button>
                        ))}

                      {/* Edit + Activate/Deactivate */}
                      <div className='flex gap-2'>
                        <Button
                          variant='secondary'
                          onClick={() => openEditModal(service)}
                          disabled={isProcessing}
                          className='flex-1'
                        >
                          Edit
                        </Button>

                        {service.active ? (
                          <Button
                            variant='secondary'
                            onClick={() => deleteService(service)}
                            disabled={isProcessing}
                            className='flex-1'
                          >
                            {isProcessing ? 'Deactivating...' : 'Deactivate'}
                          </Button>
                        ) : (
                          <Button
                            variant='secondary'
                            onClick={() => activate(service)}
                            disabled={isProcessing}
                            className='flex-1'
                          >
                            {isProcessing ? 'Activating...' : 'Activate'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Create / Edit Service Modal */}
      <Modal
        open={showServiceModal}
        onClose={() => !savingService && setShowServiceModal(false)}
        title={editingService ? 'Edit service' : 'Add service'}
        maxWidth='max-w-lg'
      >
        <form
          onSubmit={saveService}
          className='flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1'
        >
          <FormInput
            id='serviceName'
            label='Service name'
            type='text'
            required
            placeholder='Sunday Service'
            value={form.name}
            onChange={handleFormChange('name')}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormSelect
              id='serviceDay'
              label='Day'
              placeholder='Select day'
              options={dayOptions}
              value={form.dayOfWeek}
              onChange={handleFormChange('dayOfWeek')}
            />

            <FormInput
              id='serviceStartTime'
              label='Start time'
              type='time'
              required
              value={form.startTime}
              onChange={handleFormChange('startTime')}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <FormInput
              id='openBeforeMinutes'
              label='Open before'
              type='number'
              min='0'
              required
              value={form.openBeforeMinutes}
              onChange={handleFormChange('openBeforeMinutes')}
            />

            <FormInput
              id='closeAfterMinutes'
              label='Close after'
              type='number'
              min='0'
              required
              value={form.closeAfterMinutes}
              onChange={handleFormChange('closeAfterMinutes')}
            />

            <FormInput
              id='graceMinutes'
              label='Grace period'
              type='number'
              min='0'
              required
              value={form.graceMinutes}
              onChange={handleFormChange('graceMinutes')}
            />
          </div>

          <div className='rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'>
            <p>
              <strong>Open before:</strong> How many minutes before the service
              members can check in
            </p>

            <p className='mt-1'>
              <strong>Close after:</strong> How many minutes after the service
              starts check-in remains available
            </p>

            <p className='mt-1'>
              <strong>Grace period:</strong> Members after this time are marked
              late
            </p>
          </div>

          {serviceError && (
            <div className='rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400'>
              {serviceError}
            </div>
          )}

          <div className='flex justify-end gap-2 pt-2'>
            <Button
              type='button'
              variant='secondary'
              onClick={() => setShowServiceModal(false)}
              disabled={savingService}
            >
              Cancel
            </Button>

            <Button type='submit' disabled={savingService}>
              {savingService
                ? 'Saving...'
                : editingService
                  ? 'Save changes'
                  : 'Create service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
