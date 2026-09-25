import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

import Card from '../components/ui/Card.jsx';

import { getAnnouncements } from '../services/announcementService.js';

export default function MemberAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      setError('');

      const data = await getAnnouncements();

      setAnnouncements(data.announcements || []);
    } catch (err) {
      setError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'Announcements - Department Portal';

    fetchAnnouncements();
  }, []);

  return (
    <div className='flex min-w-0 flex-col gap-4 xl:px-10'>
      {/* Page header */}
      <div>
        <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
          Announcements
        </h1>

        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
          Stay updated with important department information
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400'>
          {error}
        </div>
      )}

      {/* Announcements */}
      <Card className='w-full min-w-0 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        {loading ? (
          <div className='flex items-center justify-center px-6 py-12'>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Loading announcements...
            </p>
          </div>
        ) : announcements.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-6 py-12 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'>
              <Bell className='h-6 w-6' />
            </div>

            <h2 className='mt-4 font-semibold text-zinc-900 dark:text-white'>
              No announcements
            </h2>

            <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
              There are no active announcements for your department right now.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-zinc-200 dark:divide-zinc-800'>
            {announcements.map((announcement) => (
              <article key={announcement._id} className='p-4 sm:p-5'>
                <div className='flex gap-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'>
                    <Bell className='h-5 w-5' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h2 className='font-semibold text-zinc-900 dark:text-white'>
                        {announcement.title}
                      </h2>

                      {announcement.priority === 'important' && (
                        <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400'>
                          Important
                        </span>
                      )}
                    </div>

                    <p className='mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400'>
                      {announcement.message}
                    </p>

                    <p className='mt-3 text-xs text-zinc-400 dark:text-zinc-500'>
                      {new Date(
                        announcement.publishAt || announcement.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
