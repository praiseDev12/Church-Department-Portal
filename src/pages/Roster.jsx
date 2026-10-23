import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, Plus, Users } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { getRosterTemplates } from '../services/rosterService.js';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import AppLoader from '../components/ui/AppLoader.jsx';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

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

const formatDutySchedule = (duty) => {
  const day = DAYS[duty.dayOfWeek] || '';

  const start = formatTime(duty.startTime);
  const end = duty.endTime ? formatTime(duty.endTime) : null;

  return end ? `${day} · ${start} - ${end}` : `${day} · ${start}`;
};

export default function Roster() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Roster';

    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getRosterTemplates();

        setTemplates(response.templates || []);
      } catch (err) {
        console.error('Load roster templates error:', err);
        setError(err.message || 'Failed to load roster templates.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

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
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-semibold text-gray-900 dark:text-white'>
            Roster
          </h1>

          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Manage your unit schedules and monthly assignments.
          </p>
        </div>

        <Button
          type='button'
          className='mt-5'
          onClick={() => navigate('/roster/create')}
        >
          <Plus className='h-4 w-4' />
          Create Roster
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400'>
            {error}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!error && templates.length === 0 && (
        <Card>
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
              <CalendarDays className='h-6 w-6' />
            </div>

            <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
              No rosters yet
            </h2>

            <p className='mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400'>
              Create a roster template to define your recurring unit duties and
              start generating monthly rosters.
            </p>

            <Button
              type='button'
              className='mt-5'
              onClick={() => navigate('/roster/create')}
            >
              <Plus className='h-4 w-4' />
              Create Roster
            </Button>
          </div>
        </Card>
      )}

      {/* Templates */}
      {templates.length > 0 && (
        <div className='grid gap-5 lg:grid-cols-2'>
          {templates.map((template) => {
            const activeDuties =
              template.duties?.filter((duty) => duty.active !== false) || [];

            const roleCount = activeDuties.reduce(
              (total, duty) =>
                total + (duty.rolesEnabled ? duty.roles?.length || 0 : 0),
              0,
            );

            return (
              <Card key={template._id}>
                <div className='space-y-5'>
                  {/* Template heading */}
                  <div>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
                          {template.name}
                        </h2>

                        {template.description && (
                          <p className='mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400'>
                            {template.description}
                          </p>
                        )}
                      </div>

                      <span className='shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400'>
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60'>
                      <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                        <CalendarDays className='h-4 w-4' />

                        <span className='text-xs'>Recurring duties</span>
                      </div>

                      <p className='mt-2 font-display text-lg font-semibold text-gray-900 dark:text-white'>
                        {activeDuties.length}
                      </p>
                    </div>

                    <div className='rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60'>
                      <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                        <Users className='h-4 w-4' />

                        <span className='text-xs'>Active roles</span>
                      </div>

                      <p className='mt-2 font-display text-lg font-semibold text-gray-900 dark:text-white'>
                        {roleCount}
                      </p>
                    </div>
                  </div>

                  {/* Duties */}
                  {activeDuties.length > 0 && (
                    <div>
                      <h3 className='mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                        Schedule
                      </h3>

                      <div className='space-y-2'>
                        {activeDuties.map((duty) => (
                          <div
                            key={duty._id}
                            className='flex items-start gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800'
                          >
                            <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
                              <Clock3 className='h-4 w-4' />
                            </div>

                            <div className='min-w-0'>
                              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                {duty.name}
                              </p>

                              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                                {formatDutySchedule(duty)}
                              </p>

                              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                                {duty.membersNeeded}{' '}
                                {duty.membersNeeded === 1
                                  ? 'member'
                                  : 'members'}
                                {duty.location ? ` · ${duty.location}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className='border-t border-gray-100 pt-4 dark:border-gray-800'>
                    <Button
                      type='button'
                      variant='secondary'
                      className='w-full'
                      onClick={() =>
                        navigate(`/roster/template/${template._id}`)
                      }
                    >
                      Open Roster
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
