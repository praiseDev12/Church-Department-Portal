import { useEffect, useState } from 'react';
import { CalendarDays, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getPublishedRosters } from '../services/rosterService';

const formatMonth = (month) => {
  if (!month) return '';

  const [year, monthNumber] = month.split('-');

  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const formatPublishedDate = (date) => {
  if (!date) return 'Unknown';

  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function RosterPublished() {
  const navigate = useNavigate();

  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPublishedRosters = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getPublishedRosters();

        setRosters(response.rosters || []);
      } catch (err) {
        console.error('Load published rosters error:', err);

        setError(err.message || 'Failed to load published rosters.');
      } finally {
        setLoading(false);
      }
    };

    loadPublishedRosters();
  }, []);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='font-display text-2xl font-semibold text-gray-900 dark:text-white'>
          Published Rosters
        </h1>

        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          View rosters that have already been published.
        </p>
      </div>

      {error && (
        <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400'>
          {error}
        </div>
      )}

      {loading ? (
        <div className='flex items-center justify-center py-16'>
          <Loader2 className='h-6 w-6 animate-spin text-brand-600' />
        </div>
      ) : rosters.length === 0 ? (
        <Card>
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
              <CalendarDays className='h-6 w-6 text-gray-500 dark:text-gray-400' />
            </div>

            <h2 className='mt-4 font-display text-lg font-semibold text-gray-900 dark:text-white'>
              No published rosters
            </h2>

            <p className='mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400'>
              Published rosters will appear here once you publish one.
            </p>
          </div>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {rosters.map((roster) => (
            <Card key={roster._id}>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='min-w-0'>
                  <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
                    {roster.name}
                  </h2>

                  <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400'>
                    <span className='flex items-center gap-1.5'>
                      <CalendarDays className='h-4 w-4' />
                      {formatMonth(roster.month)}
                    </span>

                    <span>
                      Published {formatPublishedDate(roster.publishedAt)}
                    </span>
                  </div>
                </div>

                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => navigate(`/roster/${roster._id}`)}
                  className='w-full sm:w-auto'
                >
                  <Eye className='h-4 w-4' />
                  View Roster
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
