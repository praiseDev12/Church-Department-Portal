import { useEffect, useState } from 'react';

import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';

import {
  createAnnouncement,
  getAdminAnnouncements,
  deleteAnnouncement,
} from '../services/announcementService.js';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    announcement: null,
  });

  const [form, setForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    notificationFrequency: 'once',
    expiresAt: '',
  });

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      setError('');

      const data = await getAdminAnnouncements();

      setAnnouncements(data.announcements || []);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'Announcements - Department Management';

    fetchAnnouncements();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function isExpired(announcement) {
    return (
      announcement.expiresAt && new Date(announcement.expiresAt) <= new Date()
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError('');

    if (!form.title.trim()) {
      setFormError('Please enter an announcement title.');

      return;
    }

    if (!form.message.trim()) {
      setFormError('Please enter the announcement message.');

      return;
    }

    try {
      setSubmitting(true);

      const data = await createAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority,
        notificationFrequency: form.notificationFrequency,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
      });

      if (data.announcement) {
        setAnnouncements((current) => [data.announcement, ...current]);
      }

      setForm({
        title: '',
        message: '',
        priority: 'normal',
        notificationFrequency: 'once',
        expiresAt: '',
      });

      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create announcement.');
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteModal(announcement) {
    setError('');

    setDeleteModal({
      open: true,
      announcement,
    });
  }

  function closeDeleteModal() {
    if (deletingId) {
      return;
    }

    setDeleteModal({
      open: false,
      announcement: null,
    });
  }

  async function handleDelete() {
    const announcement = deleteModal.announcement;

    if (!announcement) {
      return;
    }

    try {
      setDeletingId(announcement._id);
      setError('');

      await deleteAnnouncement(announcement._id);

      setAnnouncements((current) =>
        current.filter((item) => item._id !== announcement._id),
      );

      setDeleteModal({
        open: false,
        announcement: null,
      });
    } catch (err) {
      setError(err.message || 'Failed to remove announcement.');
    } finally {
      setDeletingId(null);
    }
  }

  const deleteAnnouncementData = deleteModal.announcement;

  return (
    <>
      <div className='flex min-w-0 flex-col gap-4'>
        {/* Page header */}
        <div className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='min-w-0'>
            <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
              Announcements
            </h1>

            <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
              Share important updates with your department
            </p>
          </div>

          <Button
            type='button'
            onClick={() => {
              setFormError('');

              setShowForm((current) => !current);
            }}
            className='w-full sm:w-auto'
          >
            <Plus className='h-4 w-4' />

            {showForm ? 'Close' : 'New announcement'}
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card className='border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <div>
                <h2 className='font-semibold text-zinc-900 dark:text-white'>
                  Create announcement
                </h2>

                <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                  Members will receive a push notification when this is
                  published.
                </p>
              </div>

              {formError && (
                <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400'>
                  {formError}
                </div>
              )}

              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor='announcement-title'
                  className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                >
                  Title
                </label>

                <input
                  id='announcement-title'
                  name='title'
                  type='text'
                  value={form.title}
                  onChange={handleChange}
                  placeholder='e.g. Department meeting'
                  maxLength={200}
                  className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor='announcement-message'
                  className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                >
                  Message
                </label>

                <textarea
                  id='announcement-message'
                  name='message'
                  value={form.message}
                  onChange={handleChange}
                  placeholder='Write your announcement...'
                  rows={5}
                  maxLength={5000}
                  className='w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='announcement-priority'
                    className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                  >
                    Priority
                  </label>

                  <select
                    id='announcement-priority'
                    name='priority'
                    value={form.priority}
                    onChange={handleChange}
                    className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
                  >
                    <option value='normal'>Normal</option>

                    <option value='important'>Important</option>
                  </select>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='announcement-frequency'
                    className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                  >
                    Notification frequency
                  </label>

                  <select
                    id='announcement-frequency'
                    name='notificationFrequency'
                    value={form.notificationFrequency}
                    onChange={handleChange}
                    className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
                  >
                    <option value='once'>Once</option>

                    <option value='every_30_seconds'>
                      Every 30 seconds (Testing)
                    </option>

                    <option value='every_6_hours'>Every 6 hours</option>

                    <option value='every_12_hours'>Every 12 hours</option>

                    <option value='daily'>Daily</option>
                  </select>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='announcement-expires'
                    className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                  >
                    Expires
                  </label>

                  <input
                    id='announcement-expires'
                    name='expiresAt'
                    type='datetime-local'
                    value={form.expiresAt}
                    onChange={handleChange}
                    className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
                  />
                </div>
              </div>

              <div className='flex'>
                <Button
                  type='submit'
                  disabled={submitting}
                  className='w-full sm:w-auto'
                >
                  {submitting ? 'Publishing...' : 'Publish announcement'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400'>
            {error}
          </div>
        )}

        {/* Announcements */}
        <Card className='w-full min-w-0 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
          {loading ? (
            <div className='flex items-center justify-center px-4 py-12 sm:px-6'>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                Loading announcements...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <div className='flex flex-col items-center justify-center px-4 py-12 text-center sm:px-6'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'>
                <Bell className='h-6 w-6' />
              </div>

              <h2 className='mt-4 font-semibold text-zinc-900 dark:text-white'>
                No announcements yet
              </h2>

              <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
                Create your first announcement to keep your department informed.
              </p>
            </div>
          ) : (
            <div className='divide-y divide-zinc-200 dark:divide-zinc-800'>
              {announcements.map((announcement) => {
                const expired = isExpired(announcement);

                return (
                  <article key={announcement._id} className='p-4 sm:p-5'>
                    <div className='flex min-w-0 gap-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'>
                        <Bell className='h-5 w-5' />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex min-w-0 items-start justify-between gap-2'>
                          <div className='flex min-w-0 flex-wrap items-center gap-2'>
                            <h2 className='min-w-0 wrap-break-words font-semibold text-zinc-900 dark:text-white'>
                              {announcement.title}
                            </h2>

                            {announcement.priority === 'important' && (
                              <span className='shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400'>
                                Important
                              </span>
                            )}

                            {expired && (
                              <span className='shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'>
                                Expired
                              </span>
                            )}
                          </div>

                          <button
                            type='button'
                            onClick={() => openDeleteModal(announcement)}
                            disabled={deletingId === announcement._id}
                            aria-label={`Remove ${announcement.title}`}
                            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-red-950/30 dark:hover:text-red-400'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>

                        <p className='mt-1 wrap-break-words whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-400'>
                          {announcement.message}
                        </p>

                        <div className='mt-3 flex flex-col gap-1 text-xs text-zinc-400 dark:text-zinc-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3'>
                          <span>
                            Published:{' '}
                            {new Date(
                              announcement.publishAt || announcement.createdAt,
                            ).toLocaleString()}
                          </span>

                          {announcement.expiresAt && (
                            <span>
                              {expired ? 'Expired:' : 'Expires:'}{' '}
                              {new Date(
                                announcement.expiresAt,
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        title='Remove announcement'
        maxWidth='max-w-md'
      >
        <div className='flex flex-col gap-4'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400'>
              <AlertTriangle className='h-5 w-5' />
            </div>

            <div className='min-w-0'>
              <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                Are you sure you want to remove this announcement?
              </p>

              {deleteAnnouncementData && (
                <p className='mt-2 wrap-break-words font-medium text-zinc-900 dark:text-white'>
                  "{deleteAnnouncementData.title}"
                </p>
              )}

              <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
                Removing it will stop any future notifications for this
                announcement.
              </p>
            </div>
          </div>

          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              onClick={closeDeleteModal}
              disabled={Boolean(deletingId)}
              className='w-full sm:w-auto'
            >
              Cancel
            </Button>

            <Button
              type='button'
              onClick={handleDelete}
              disabled={Boolean(deletingId)}
              className='w-full bg-red-600 hover:bg-red-700 sm:w-auto'
            >
              <Trash2 className='h-4 w-4' />

              {deletingId ? 'Removing...' : 'Remove announcement'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
