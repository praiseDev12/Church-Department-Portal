import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Download,
  FileImage,
  FileText,
} from 'lucide-react';

import {
  addRosterAssignment,
  getMonthlyRoster,
  publishMonthlyRoster,
  removeRosterAssignment,
  updateRosterAssignment,
  deleteDraftRoster,
} from '../services/rosterService.js';

import {
  exportRosterImage,
  exportRosterPdf,
} from '../services/rosterExportService.js';

import { getMembers } from '../services/memberService.js';

import Card from '../components/ui/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
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

const formatTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime);

  if (!endTime) {
    return start;
  }

  return `${start} - ${formatTime(endTime)}`;
};

const formatMonth = (month) => {
  if (!month) return '';

  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1, 1);

  return date.toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });
};

const getMemberName = (assignment) => {
  if (assignment.member?.fullName) {
    return assignment.member.fullName;
  }

  return 'Unknown member';
};

const getMemberId = (member) => member?._id || member?.id || '';

export default function RosterMonthly() {
  const { user } = useAuth();
  const { rosterId } = useParams();
  const navigate = useNavigate();

  const [roster, setRoster] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [deleteDraftModal, setDeleteDraftModal] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState(false);

  const [publishModal, setPublishModal] = useState(false);

  const [error, setError] = useState('');

  const [assignmentModal, setAssignmentModal] = useState(null);
  const [memberId, setMemberId] = useState('');
  const [roleName, setRoleName] = useState('');

  const [memberSearch, setMemberSearch] = useState('');

  const loadRoster = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getMonthlyRoster(rosterId);

      if (!response?.roster) {
        throw new Error('Monthly roster was not found.');
      }

      setRoster(response.roster);
    } catch (err) {
      console.error('Load monthly roster error:', err);

      setError(err.message || 'Failed to load the monthly roster.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (search = '') => {
    try {
      setMembersLoading(true);

      const response = await getMembers({
        search,
        page: 1,
        limit: 50,
      });

      const fetchedMembers = response?.members || response?.data?.members || [];

      setMembers(fetchedMembers);
    } catch (err) {
      console.error('Load roster members error:', err);

      setError(err.message || 'Failed to load members.');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Monthly Roster';
    loadRoster();
  }, [rosterId]);

  useEffect(() => {
    if (!assignmentModal) return;

    loadMembers('');
  }, [assignmentModal]);

  useEffect(() => {
    if (!assignmentModal) return;

    const timer = setTimeout(() => {
      loadMembers(memberSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [memberSearch, assignmentModal]);

  const summary = useMemo(() => {
    if (!roster) {
      return {
        occurrences: 0,
        assignments: 0,
        requiredAssignments: 0,
        attentionCount: 0,
      };
    }

    return roster.occurrences.reduce(
      (result, occurrence) => {
        result.occurrences += 1;
        result.assignments += occurrence.assignments?.length || 0;
        result.requiredAssignments += occurrence.membersNeeded || 0;

        if (occurrence.needsAttention) {
          result.attentionCount += 1;
        }

        return result;
      },
      {
        occurrences: 0,
        assignments: 0,
        requiredAssignments: 0,
        attentionCount: 0,
      },
    );
  }, [roster]);

  const assignedMemberIds = useMemo(() => {
    if (!assignmentModal?.occurrence) {
      return new Set();
    }

    return new Set(
      (assignmentModal.occurrence.assignments || []).map((assignment) =>
        String(assignment.member?._id || assignment.member || ''),
      ),
    );
  }, [assignmentModal]);

  const availableMembers = useMemo(() => {
    return members.filter((member) => {
      const currentId = String(getMemberId(member));

      if (!currentId) return false;

      if (assignmentModal?.type === 'edit' && currentId === String(memberId)) {
        return true;
      }

      return !assignedMemberIds.has(currentId);
    });
  }, [members, assignedMemberIds, assignmentModal, memberId]);

  const selectedMember = useMemo(() => {
    return members.find(
      (member) => String(getMemberId(member)) === String(memberId),
    );
  }, [members, memberId]);

  const closeAssignmentModal = () => {
    if (actionLoading) return;

    setAssignmentModal(null);
    setMemberId('');
    setRoleName('');
    setMemberSearch('');
  };

  const openAddModal = (occurrence) => {
    setMemberId('');
    setRoleName('');
    setMemberSearch('');

    setAssignmentModal({
      type: 'add',
      occurrence,
      assignment: null,
    });
  };

  const openEditModal = (occurrence, assignment) => {
    setMemberId(assignment.member?._id || assignment.member || '');

    setRoleName(assignment.roleName || '');
    setMemberSearch('');

    setAssignmentModal({
      type: 'edit',
      occurrence,
      assignment,
    });
  };

  const handleSelectMember = (member) => {
    setMemberId(getMemberId(member));
    setMemberSearch('');
  };

  const handleSaveAssignment = async () => {
    if (!assignmentModal || !memberId) {
      setError('Please select a member.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const { type, occurrence, assignment } = assignmentModal;

      if (type === 'add') {
        await addRosterAssignment(rosterId, occurrence._id, {
          memberId,
          roleName,
        });
      } else {
        await updateRosterAssignment(rosterId, occurrence._id, assignment._id, {
          memberId,
          roleName,
        });
      }

      closeAssignmentModal();
      await loadRoster();
    } catch (err) {
      console.error('Save roster assignment error:', err);

      setError(err.message || 'Failed to save the assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAssignment = async (occurrence, assignment) => {
    const memberName = getMemberName(assignment);

    const confirmed = window.confirm(
      `Remove ${memberName} from this assignment?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      await removeRosterAssignment(rosterId, occurrence._id, assignment._id);

      await loadRoster();
    } catch (err) {
      console.error('Remove roster assignment error:', err);

      setError(err.message || 'Failed to remove the assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishRoster = async () => {
    if (!roster || roster.status !== 'draft') return;

    if (summary.attentionCount > 0) {
      setError('Please resolve all roster shortages before publishing.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      await publishMonthlyRoster(rosterId);

      await loadRoster();
    } catch (err) {
      console.error('Publish roster error:', err);

      setError(err.message || 'Failed to publish the roster.');
    } finally {
      setActionLoading(false);
      setPublishModal(false);
    }
  };

  const handleExportPng = async () => {
    if (!roster || roster.status !== 'published') return;

    try {
      setActionLoading(true);
      setError('');

      await exportRosterImage(roster, user?.department?.name || 'Department');
    } catch (err) {
      console.error('Export roster PNG error:', err);

      setError(err.message || 'Failed to export the roster as PNG.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!roster || roster.status !== 'published') return;

    try {
      setActionLoading(true);
      setError('');

      await exportRosterPdf(roster, user?.department?.name || 'Department');
    } catch (err) {
      console.error('Export roster PDF error:', err);

      setError(err.message || 'Failed to export the roster as PDF.');
    } finally {
      setActionLoading(false);
    }
  };

  const openPublishModal = () => {
    if (!roster || roster.status !== 'draft') return;

    if (summary.attentionCount > 0) {
      setError('Please resolve all roster shortages before publishing.');
      return;
    }

    setPublishModal(true);
  };

  const closePublishModal = () => {
    if (actionLoading) return;

    setPublishModal(false);
  };

  const openDeleteDraftModal = () => {
    setDeleteDraftModal(true);
  };

  const closeDeleteDraftModal = () => {
    if (deletingDraft) return;

    setDeleteDraftModal(false);
  };

  const handleDeleteDraft = async () => {
    try {
      setDeletingDraft(true);
      setError('');

      await deleteDraftRoster(rosterId);

      navigate(`/roster/template/${roster.template?._id || roster.template}`);
    } catch (err) {
      console.error('Delete draft roster error:', err);

      setError(err.message || 'Failed to delete the draft roster.');
    } finally {
      setDeletingDraft(false);
      setDeleteDraftModal(false);
    }
  };

  if (error && !roster) {
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

  if (!roster) return null;

  const isDraft = roster.status === 'draft';
  const isPublished = roster.status === 'published';

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-4'>
        <Button
          type='button'
          variant='secondary'
          onClick={() => navigate('/roster')}
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Roster
        </Button>

        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='font-display text-2xl font-semibold text-gray-900 dark:text-white'>
                {formatMonth(roster.month)}
              </h1>

              <span
                className={
                  isPublished
                    ? 'rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                }
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {roster.name}
            </p>
          </div>
        </div>
      </div>
      {/* Error */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400'>
          {error}
        </div>
      )}
      {/* Summary */}
      <div className='grid gap-3 sm:grid-cols-3'>
        <Card>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
              <CalendarDays className='h-5 w-5' />
            </div>

            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Occurrences
              </p>

              <p className='font-display text-xl font-semibold text-gray-900 dark:text-white'>
                {summary.occurrences}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
              <Users className='h-5 w-5' />
            </div>

            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Assignments
              </p>

              <p className='font-display text-xl font-semibold text-gray-900 dark:text-white'>
                {summary.assignments}
                <span className='ml-1 text-sm font-normal text-gray-400'>
                  / {summary.requiredAssignments}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className='flex items-center gap-3'>
            <div
              className={
                summary.attentionCount > 0
                  ? 'flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              }
            >
              {summary.attentionCount > 0 ? (
                <AlertTriangle className='h-5 w-5' />
              ) : (
                <CheckCircle2 className='h-5 w-5' />
              )}
            </div>

            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Attention required
              </p>

              <p className='font-display text-xl font-semibold text-gray-900 dark:text-white'>
                {summary.attentionCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {roster.status === 'published' && (
        <Card>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <div className='flex items-center gap-2'>
                <Download className='h-4 w-4 text-brand-500' />

                <p className='text-sm font-medium text-gray-900 dark:text-white'>
                  Export roster
                </p>
              </div>

              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Download this published roster as an image or PDF.
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='secondary'
                onClick={handleExportPng}
                disabled={actionLoading}
              >
                <FileImage className='mr-2 h-4 w-4' />
                {actionLoading ? 'Exporting...' : 'Export PNG'}
              </Button>

              <Button
                type='button'
                onClick={handleExportPdf}
                disabled={actionLoading}
              >
                <FileText className='mr-2 h-4 w-4' />
                {actionLoading ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Attention notice */}
      {summary.attentionCount > 0 && (
        <div className='flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20'>
          <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400' />

          <div>
            <p className='text-sm font-semibold text-amber-800 dark:text-amber-300'>
              Some occurrences need attention
            </p>

            <p className='mt-1 text-sm text-amber-700 dark:text-amber-400'>
              Some duties do not have enough members assigned. Add or replace
              members before publishing the roster.
            </p>
          </div>
        </div>
      )}
      {/* Schedule */}
      <div>
        <div className='mb-4'>
          <h2 className='font-display text-lg font-semibold text-gray-900 dark:text-white'>
            Schedule
          </h2>

          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Review and adjust assignments for each scheduled duty.
          </p>
        </div>

        <div className='space-y-4'>
          {roster.occurrences.map((occurrence) => {
            const assignedCount = occurrence.assignments?.length || 0;

            const isComplete =
              assignedCount >= occurrence.membersNeeded &&
              !occurrence.needsAttention;

            const canAdd = isDraft && assignedCount < occurrence.membersNeeded;

            return (
              <Card key={occurrence._id}>
                <div className='space-y-5'>
                  {/* Occurrence header */}
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <h3 className='font-display text-base font-semibold text-gray-900 dark:text-white'>
                        {occurrence.eventName}
                      </h3>

                      <div className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400'>
                        <span className='flex items-center gap-1.5'>
                          <CalendarDays className='h-3.5 w-3.5' />
                          {formatDate(occurrence.date)}
                        </span>

                        <span className='flex items-center gap-1.5'>
                          <Clock3 className='h-3.5 w-3.5' />
                          {formatTimeRange(
                            occurrence.startTime,
                            occurrence.endTime,
                          )}
                        </span>

                        {occurrence.location && (
                          <span className='flex items-center gap-1.5'>
                            <MapPin className='h-3.5 w-3.5' />
                            {occurrence.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={
                        isComplete
                          ? 'w-fit rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      }
                    >
                      {assignedCount} / {occurrence.membersNeeded} assigned
                    </span>
                  </div>

                  {/* Attention */}
                  {occurrence.needsAttention && (
                    <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20'>
                      <p className='text-sm font-medium text-amber-800 dark:text-amber-300'>
                        {occurrence.shortageCount}{' '}
                        {occurrence.shortageCount === 1
                          ? 'assignment slot'
                          : 'assignment slots'}{' '}
                        need attention.
                      </p>
                    </div>
                  )}

                  {/* Assignments */}
                  <div className='space-y-2'>
                    {occurrence.assignments?.map((assignment) => (
                      <div
                        key={assignment._id}
                        className='flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800'
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'>
                            {getMemberName(assignment).charAt(0).toUpperCase()}
                          </div>

                          <div className='min-w-0'>
                            <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                              {getMemberName(assignment)}
                            </p>

                            {assignment.roleName && (
                              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                                {assignment.roleName}
                              </p>
                            )}
                          </div>
                        </div>

                        {isDraft && (
                          <div className='flex shrink-0 items-center gap-1'>
                            <button
                              type='button'
                              onClick={() =>
                                openEditModal(occurrence, assignment)
                              }
                              disabled={actionLoading}
                              className='flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                              aria-label={`Edit ${getMemberName(assignment)}`}
                            >
                              <Pencil className='h-4 w-4' />
                            </button>

                            <button
                              type='button'
                              onClick={() =>
                                handleRemoveAssignment(occurrence, assignment)
                              }
                              disabled={actionLoading}
                              className='flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400'
                              aria-label={`Remove ${getMemberName(assignment)}`}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        )}

                        {assignment.manuallyAssigned && !isDraft && (
                          <span className='shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                            Manual
                          </span>
                        )}
                      </div>
                    ))}

                    {canAdd && (
                      <button
                        type='button'
                        onClick={() => openAddModal(occurrence)}
                        disabled={actionLoading}
                        className='flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-700 dark:hover:bg-brand-950/20 dark:hover:text-brand-400'
                      >
                        <Plus className='h-4 w-4' />
                        Add member
                      </button>
                    )}

                    {!occurrence.assignments?.length && !canAdd && (
                      <div className='rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400'>
                        No members assigned.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {/* Draft footer */}
      {isDraft && (
        <Card>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                Roster is still a draft
              </p>

              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Complete all assignment slots before publishing.
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={openDeleteDraftModal}
                disabled={deletingDraft}
                className='text-red-500 hover:text-red-500'
              >
                <Trash2 className='h-4 w-4' />
                Delete Draft
              </Button>

              <Button
                type='button'
                onClick={openPublishModal}
                disabled={actionLoading || summary?.attentionCount > 0}
                title={
                  summary?.attentionCount > 0
                    ? 'Resolve all roster shortages before publishing.'
                    : 'Publish this roster'
                }
              >
                {actionLoading ? 'Publishing...' : 'Publish Roster'}
              </Button>
            </div>
          </div>
        </Card>
      )}
      {/* Assignment modal */}
      {assignmentModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div
            className='w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900'
            role='dialog'
            aria-modal='true'
            aria-labelledby='assignment-modal-title'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2
                  id='assignment-modal-title'
                  className='font-display text-lg font-semibold text-gray-900 dark:text-white'
                >
                  {assignmentModal.type === 'add'
                    ? 'Add member'
                    : 'Edit assignment'}
                </h2>

                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  {assignmentModal.occurrence.eventName}
                  {' · '}
                  {formatDate(assignmentModal.occurrence.date)}
                </p>
              </div>

              <button
                type='button'
                onClick={closeAssignmentModal}
                disabled={actionLoading}
                className='flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800'
                aria-label='Close'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='mt-5 space-y-4'>
              {/* Member selector */}
              <div>
                <label
                  htmlFor='roster-member-search'
                  className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Member
                </label>

                {selectedMember ? (
                  <div className='flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-500 p-3 dark:border-brand-900/50 dark:bg-brand-950/20'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'>
                        {selectedMember.fullName?.charAt(0).toUpperCase()}
                      </div>

                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                          {selectedMember.fullName}
                        </p>

                        {selectedMember.email && (
                          <p className='truncate text-xs text-gray-500 dark:text-gray-400'>
                            {selectedMember.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={() => setMemberId('')}
                      disabled={actionLoading}
                      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white'
                      aria-label='Change selected member'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className='relative'>
                      <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />

                      <input
                        id='roster-member-search'
                        type='text'
                        value={memberSearch}
                        onChange={(event) =>
                          setMemberSearch(event.target.value)
                        }
                        placeholder='Search members...'
                        disabled={actionLoading}
                        autoComplete='off'
                        className='w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
                      />
                    </div>

                    <div className='mt-2 max-h-52 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800'>
                      {membersLoading ? (
                        <div className='flex items-center justify-center gap-2 p-4 text-sm text-gray-500 dark:text-gray-400'>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Loading members...
                        </div>
                      ) : availableMembers.length > 0 ? (
                        availableMembers.map((member) => (
                          <button
                            key={getMemberId(member)}
                            type='button'
                            onClick={() => handleSelectMember(member)}
                            disabled={actionLoading}
                            className='flex w-full items-center gap-3 border-b border-gray-100 p-3 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'
                          >
                            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                              {member.fullName?.charAt(0).toUpperCase()}
                            </div>

                            <div className='min-w-0'>
                              <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                                {member.fullName}
                              </p>

                              {member.email && (
                                <p className='truncate text-xs text-gray-500 dark:text-gray-400'>
                                  {member.email}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className='p-4 text-center text-sm text-gray-500 dark:text-gray-400'>
                          No available members found.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor='roster-role'
                  className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Role
                </label>

                <input
                  id='roster-role'
                  type='text'
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder='e.g. Projection Operator'
                  disabled={actionLoading}
                  className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white'
                />
              </div>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <Button
                type='button'
                variant='secondary'
                onClick={closeAssignmentModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>

              <Button
                type='button'
                onClick={handleSaveAssignment}
                disabled={actionLoading || !memberId}
              >
                {actionLoading ? 'Saving...' : 'Save assignment'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {deleteDraftModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div
            className='w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900'
            role='dialog'
            aria-modal='true'
            aria-labelledby='delete-draft-modal-title'
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                  <AlertTriangle className='h-5 w-5' />
                </div>

                <div>
                  <h2
                    id='delete-draft-modal-title'
                    className='font-display text-lg font-semibold text-gray-900 dark:text-white'
                  >
                    Delete draft roster?
                  </h2>

                  <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    This will permanently delete the draft roster for{' '}
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      {formatMonth(roster.month)}
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type='button'
                onClick={closeDeleteDraftModal}
                disabled={deletingDraft}
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
                onClick={closeDeleteDraftModal}
                disabled={deletingDraft}
              >
                Cancel
              </Button>

              <Button
                type='button'
                onClick={handleDeleteDraft}
                disabled={deletingDraft}
                className='bg-red-600 text-white hover:bg-red-700'
              >
                {deletingDraft ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='mr-2 h-4 w-4' />
                )}

                {deletingDraft ? 'Deleting...' : 'Delete Draft'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {publishModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div
            className='w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900'
            role='dialog'
            aria-modal='true'
            aria-labelledby='publish-roster-modal-title'
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'>
                  <CheckCircle2 className='h-5 w-5' />
                </div>

                <div>
                  <h2
                    id='publish-roster-modal-title'
                    className='font-display text-lg font-semibold text-gray-900 dark:text-white'
                  >
                    Publish roster?
                  </h2>

                  <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    Are you sure you want to publish the roster for{' '}
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      {formatMonth(roster.month)}
                    </span>
                    ? Once published, assignments can no longer be edited.
                  </p>
                </div>
              </div>

              <button
                type='button'
                onClick={closePublishModal}
                disabled={actionLoading}
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
                onClick={closePublishModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>

              <Button
                type='button'
                onClick={handlePublishRoster}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <CheckCircle2 className='mr-2 h-4 w-4' />
                )}

                {actionLoading ? 'Publishing...' : 'Publish Roster'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
