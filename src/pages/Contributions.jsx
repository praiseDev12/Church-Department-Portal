import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  Wallet,
  Pencil,
  Trash2,
  X,
  Check,
  FileDown,
  MoreVertical,
  ImageDown,
} from 'lucide-react';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

import {
  getContributions,
  createContribution,
  addContributionEntry,
  updateContributionEntry,
  deleteContributionEntry,
  updateContribution,
  deleteContribution,
} from '../services/contributionService.js';
import { getMembers } from '../services/memberService.js';

import { exportContributionPdf } from '../utils/contributionPdf.js';
import { exportContributionImage } from '../utils/contributionImage.js';

function formatAmount(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ActionMenuItem({ icon: Icon, children, onClick, danger = false }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
      }`}
    >
      <Icon size={16} />
      <span>{children}</span>
    </button>
  );
}

export default function Contributions() {
  // State variables
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const actionMenuRef = useRef(null);
  const actionMenuPortalRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    openUpward: false,
  });

  // Filter state variables
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

  // Form state variables
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Member and entry state variables
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Entry form state variables
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [contributedAt, setContributedAt] = useState('');

  // Edit and delete contribution state variables
  const [editingContributionId, setEditingContributionId] = useState(null);
  const [editContributionTitle, setEditContributionTitle] = useState('');
  const [savingContribution, setSavingContribution] = useState(false);
  const [deletingContributionId, setDeletingContributionId] = useState(null);

  // Edit and delete contribution entry state variables
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editMemberId, setEditMemberId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editContributedAt, setEditContributedAt] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  // Functions to handle UI interactions and API calls
  function toggleExpanded(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function startEditingEntry(entry) {
    setEditingEntryId(entry._id);
    setEditMemberId(entry.member?._id || entry.member || '');
    setEditAmount(entry.amount ?? '');

    setEditContributedAt(
      entry.contributedAt
        ? new Date(entry.contributedAt).toISOString().split('T')[0]
        : '',
    );
  }

  function cancelEditingEntry() {
    setEditingEntryId(null);
    setEditMemberId('');
    setEditAmount('');
    setEditContributedAt('');
  }

  function startEditingContribution(contribution) {
    setEditingContributionId(contribution._id);
    setEditContributionTitle(contribution.title);
  }

  function cancelEditingContribution() {
    setEditingContributionId(null);
    setEditContributionTitle('');
  }

  // API interaction functions
  async function loadContributions() {
    try {
      setLoading(true);
      setError('');

      const data = await getContributions();

      setContributions(data);
    } catch (err) {
      setError(err.message || 'Failed to load contributions');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateContribution(contributionId) {
    if (!editContributionTitle.trim()) return;

    try {
      setSavingContribution(true);
      setError('');

      const updatedContribution = await updateContribution(
        contributionId,
        editContributionTitle.trim(),
      );

      setContributions((prev) =>
        prev.map((contribution) =>
          contribution._id === contributionId
            ? updatedContribution
            : contribution,
        ),
      );

      cancelEditingContribution();
    } catch (err) {
      setError(err.message || 'Failed to update contribution record');
    } finally {
      setSavingContribution(false);
    }
  }

  async function handleDeleteContribution(contributionId) {
    const contribution = contributions.find(
      (item) => item._id === contributionId,
    );

    if (!contribution) return;

    const confirmed = window.confirm(
      `Delete "${contribution.title}" and all of its member contributions? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingContributionId(contributionId);
      setError('');

      await deleteContribution(contributionId);

      setContributions((prev) =>
        prev.filter((contribution) => contribution._id !== contributionId),
      );

      if (expandedId === contributionId) {
        setExpandedId(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete contribution record');
    } finally {
      setDeletingContributionId(null);
    }
  }

  async function handleCreateContribution(e) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setCreating(true);
      setError('');

      const contribution = await createContribution(title.trim());

      setContributions((prev) => [contribution, ...prev]);
      setTitle('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create contribution');
    } finally {
      setCreating(false);
    }
  }

  async function handleAddEntry(e, contributionId) {
    e.preventDefault();

    if (!selectedMemberId || !amount) return;

    try {
      setError('');

      const entry = await addContributionEntry(contributionId, {
        memberId: selectedMemberId,
        amount,
        contributedAt: contributedAt || undefined,
      });

      setContributions((prev) =>
        prev.map((contribution) => {
          if (contribution._id !== contributionId) {
            return contribution;
          }

          const entries = [...(contribution.entries || []), entry];

          const totalAmount = entries.reduce(
            (total, item) => total + Number(item.amount || 0),
            0,
          );

          return {
            ...contribution,
            entries,
            totalAmount,
          };
        }),
      );

      setSelectedMemberId('');
      setAmount('');
      setContributedAt('');
    } catch (err) {
      setError(err.message || 'Failed to add contribution');
    }
  }

  async function handleUpdateEntry(contributionId, entryId) {
    if (!editMemberId || !editAmount) return;

    try {
      setSavingEdit(true);
      setError('');

      const updatedEntry = await updateContributionEntry(
        contributionId,
        entryId,
        {
          memberId: editMemberId,
          amount: editAmount,
          contributedAt: editContributedAt || undefined,
        },
      );

      setContributions((prev) =>
        prev.map((contribution) => {
          if (contribution._id !== contributionId) {
            return contribution;
          }

          const entries = contribution.entries.map((entry) =>
            entry._id === entryId ? updatedEntry : entry,
          );

          const totalAmount = entries.reduce(
            (total, item) => total + Number(item.amount || 0),
            0,
          );

          return {
            ...contribution,
            entries,
            totalAmount,
          };
        }),
      );

      cancelEditingEntry();
    } catch (err) {
      setError(err.message || 'Failed to update contribution');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteEntry(contributionId, entryId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this contribution?',
    );

    if (!confirmed) return;

    try {
      setDeletingEntryId(entryId);
      setError('');

      await deleteContributionEntry(contributionId, entryId);

      setContributions((prev) =>
        prev.map((contribution) => {
          if (contribution._id !== contributionId) {
            return contribution;
          }

          const entries = contribution.entries.filter(
            (entry) => entry._id !== entryId,
          );

          const totalAmount = entries.reduce(
            (total, item) => total + Number(item.amount || 0),
            0,
          );

          return {
            ...contribution,
            entries,
            totalAmount,
          };
        }),
      );
    } catch (err) {
      setError(err.message || 'Failed to delete contribution');
    } finally {
      setDeletingEntryId(null);
    }
  }

  // Load contributions and members on component mount and when memberSearch changes
  useEffect(() => {
    loadContributions();
  }, []);

  useEffect(() => {
    async function loadMembers() {
      try {
        setLoadingMembers(true);

        const data = await getMembers({
          search: memberSearch,
        });

        setMembers(data?.members || []);
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoadingMembers(false);
      }
    }

    loadMembers();
  }, [memberSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedTrigger = actionMenuRef.current?.contains(event.target);
      const clickedMenu = actionMenuPortalRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedMenu) {
        setOpenActionMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredContributions = contributions.filter((contribution) => {
    const normalizedSearch = search.trim().toLowerCase();

    const matchesSearch = contribution.title
      ?.toLowerCase()
      .includes(normalizedSearch);

    const createdDate = contribution.createdAt
      ? new Date(contribution.createdAt)
      : null;

    let matchesDate = true;

    if (createdDate && dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`);
      matchesDate = createdDate >= from;
    }

    if (createdDate && dateTo && matchesDate) {
      const to = new Date(`${dateTo}T23:59:59.999`);
      matchesDate = createdDate <= to;
    }

    const matchesMember =
      !memberFilter ||
      contribution.entries?.some((entry) => entry.member?._id === memberFilter);

    return matchesSearch && matchesDate && matchesMember;
  });

  // Render the component
  if (loading) {
    return (
      <div className='flex flex-col gap-4'>
        <h1 className='font-display text-2xl font-semibold'>Contributions</h1>

        <Card>
          <p className='py-8 text-center text-zinc-500'>
            Loading contributions...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='font-display text-2xl font-semibold'>Contributions</h1>

          <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
            Historical records of member contributions
          </p>
        </div>

        <Button
          type='button'
          onClick={() => setShowCreateForm((current) => !current)}
        >
          <Plus size={18} />
          Add Record
        </Button>
      </div>

      {error && (
        <Card>
          <p className='text-sm text-red-500'>{error}</p>
        </Card>
      )}

      <Card>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='font-semibold'>Find Contribution Records</h2>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Search and filter your contribution history
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto]'>
            <div>
              <label className='mb-1.5 block text-sm font-medium'>Search</label>

              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search by contribution title...'
                className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
              />
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium'>From</label>

              <input
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
              />
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium'>To</label>

              <input
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
              />
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium'>Member</label>

              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
              >
                <option value=''>All members</option>

                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-end'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  setSearch('');
                  setDateFrom('');
                  setDateTo('');
                  setMemberFilter('');
                }}
                disabled={!search && !dateFrom && !dateTo && !memberFilter}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className='text-sm text-zinc-500 dark:text-zinc-400'>
            Showing{' '}
            <span className='font-medium text-zinc-900 dark:text-zinc-100'>
              {filteredContributions.length}
            </span>{' '}
            of{' '}
            <span className='font-medium text-zinc-900 dark:text-zinc-100'>
              {contributions.length}
            </span>{' '}
            records
          </div>
        </div>
      </Card>

      {showCreateForm && (
        <Card>
          <form
            onSubmit={handleCreateContribution}
            className='flex flex-col gap-4'
          >
            <div>
              <h2 className='font-semibold'>New Contribution Record</h2>

              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Create an event or occasion that members contributed toward
              </p>
            </div>

            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Harison's Child Dedication"
              className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
            />

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  setShowCreateForm(false);
                  setTitle('');
                }}
              >
                Cancel
              </Button>

              <Button type='submit' disabled={creating || !title.trim()}>
                {creating ? 'Creating...' : 'Create Record'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {filteredContributions?.length === 0 ? (
        <Card>
          <div className='py-10 text-center'>
            <Wallet size={36} className='mx-auto mb-3 text-zinc-400' />

            {contributions.length === 0 ? (
              <>
                <p className='font-medium'>No contribution records yet</p>
                <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                  Create a record to start documenting member contributions
                </p>
              </>
            ) : (
              <>
                <p className='font-medium'>No matching records</p>
                <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                  Try changing your search or date filters
                </p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className='flex flex-col gap-3'>
          {filteredContributions?.map((contribution) => {
            const isExpanded = expandedId === contribution._id;

            return (
              <Card key={contribution._id} className='overflow-visible'>
                <div className='flex w-full items-start justify-between gap-3 text-left'>
                  {editingContributionId === contribution._id ? (
                    <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row'>
                      <input
                        type='text'
                        value={editContributionTitle}
                        onChange={(e) =>
                          setEditContributionTitle(e.target.value)
                        }
                        autoFocus
                        className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
                      />

                      <div className='flex shrink-0 items-center gap-1'>
                        <button
                          type='button'
                          onClick={() =>
                            handleUpdateContribution(contribution._id)
                          }
                          disabled={
                            savingContribution || !editContributionTitle.trim()
                          }
                          className='rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-950'
                          title='Save title'
                        >
                          <Check size={17} />
                        </button>

                        <button
                          type='button'
                          onClick={cancelEditingContribution}
                          disabled={savingContribution}
                          className='rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800'
                          title='Cancel'
                        >
                          <X size={17} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type='button'
                      onClick={() => toggleExpanded(contribution._id)}
                      className='min-w-0 flex-1 text-left'
                    >
                      <h2 className='truncate font-semibold'>
                        {contribution.title}
                      </h2>

                      <div className='mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400'>
                        <span className='flex items-center gap-1.5'>
                          <Users size={15} />
                          {contribution.entries?.length || 0} contributors
                        </span>

                        <span>
                          Recorded {formatDate(contribution.createdAt)}
                        </span>
                      </div>
                    </button>
                  )}

                  <div className='flex shrink-0 items-center gap-1'>
                    <span className='hidden sm:inline font-semibold'>
                      {formatAmount(contribution.totalAmount)}
                    </span>

                    {/* ACTION MENU */}
                    <div ref={actionMenuRef} className='relative'>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();

                          const rect = e.currentTarget.getBoundingClientRect();

                          const menuWidth = 208;
                          const menuHeight = 190;
                          const gap = 8;

                          const spaceBelow = window.innerHeight - rect.bottom;
                          const spaceAbove = rect.top;

                          const openUpward =
                            spaceBelow < menuHeight + gap &&
                            spaceAbove >= menuHeight + gap;

                          let top;

                          if (openUpward) {
                            top = rect.top - menuHeight - gap;
                          } else {
                            top = rect.bottom + gap;
                          }

                          let left = rect.right - menuWidth;

                          if (left < 8) {
                            left = 8;
                          }

                          if (left + menuWidth > window.innerWidth - 8) {
                            left = window.innerWidth - menuWidth - 8;
                          }

                          setMenuPosition({
                            top: Math.max(8, top),
                            left,
                            openUpward,
                          });

                          const menuId = `contribution-${contribution._id}`;

                          setOpenActionMenu((current) =>
                            current === menuId ? null : menuId,
                          );
                        }}
                        className='rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                        title='Actions'
                        aria-label='Contribution actions'
                      >
                        <MoreVertical size={20} />
                      </button>
                      {openActionMenu === `contribution-${contribution._id}` &&
                        createPortal(
                          <div
                            ref={actionMenuPortalRef}
                            className='fixed z-9999 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900'
                            style={{
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ActionMenuItem
                              icon={FileDown}
                              onClick={() => {
                                setOpenActionMenu(null);
                                exportContributionPdf(contribution);
                              }}
                            >
                              Export PDF
                            </ActionMenuItem>

                            <ActionMenuItem
                              icon={ImageDown}
                              onClick={() => {
                                setOpenActionMenu(null);
                                exportContributionImage(contribution);
                              }}
                            >
                              Export Image
                            </ActionMenuItem>

                            <ActionMenuItem
                              icon={Pencil}
                              onClick={() => {
                                setOpenActionMenu(null);
                                startEditingContribution(contribution);
                              }}
                            >
                              Edit contribution
                            </ActionMenuItem>

                            <div className='my-1 border-t border-zinc-200 dark:border-zinc-800' />

                            <ActionMenuItem
                              icon={Trash2}
                              danger
                              onClick={() => {
                                setOpenActionMenu(null);
                                handleDeleteContribution(contribution._id);
                              }}
                            >
                              Delete contribution
                            </ActionMenuItem>
                          </div>,
                          document.body,
                        )}
                    </div>

                    {/* EXPAND BUTTON */}
                    <button
                      type='button'
                      onClick={() => toggleExpanded(contribution._id)}
                      className='rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                      title={isExpanded ? 'Collapse' : 'Expand'}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className='mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800'>
                    <form
                      onSubmit={(e) => handleAddEntry(e, contribution._id)}
                      className='mb-5 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900'
                    >
                      <div className='mb-4'>
                        <h3 className='font-semibold'>
                          Add Member Contribution
                        </h3>
                        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                          Record a contribution made toward this event
                        </p>
                      </div>

                      <div className='grid gap-4 md:grid-cols-3'>
                        <div>
                          <label className='mb-1.5 block text-sm font-medium'>
                            Member
                          </label>

                          <select
                            value={selectedMemberId}
                            onChange={(e) =>
                              setSelectedMemberId(e.target.value)
                            }
                            className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800'
                          >
                            <option value=''>Select member</option>

                            {members?.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.fullName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className='mb-1.5 block text-sm font-medium'>
                            Amount
                          </label>

                          <input
                            type='number'
                            min='0'
                            step='0.01'
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder='e.g. 5000'
                            className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800'
                          />
                        </div>

                        <div>
                          <label className='mb-1.5 block text-sm font-medium'>
                            Contribution Date
                          </label>

                          <input
                            type='date'
                            value={contributedAt}
                            onChange={(e) => setContributedAt(e.target.value)}
                            className='w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800'
                          />
                        </div>
                      </div>

                      <div className='mt-4 flex justify-end'>
                        <Button
                          type='submit'
                          disabled={!selectedMemberId || !amount}
                        >
                          Add Contribution
                        </Button>
                      </div>
                    </form>
                    {contribution.entries?.length === 0 ? (
                      <p className='py-4 text-center text-sm text-zinc-500'>
                        No member contributions recorded yet.
                      </p>
                    ) : (
                      <div className='overflow-x-auto'>
                        <table className='w-full text-left text-sm scrollbar-thin scrollbar-track-transparent'>
                          <thead>
                            <tr className='border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400'>
                              <th className='py-2 pr-4 font-medium'>Member</th>

                              <th className='py-2 pr-4 font-medium'>Amount</th>

                              <th className='py-2 pr-4 font-medium'>
                                Contribution Date
                              </th>

                              <th className='py-2 pr-4 font-medium'>
                                Recorded
                              </th>
                              <th className='py-2 pr-4 font-medium'>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {contribution.entries.map((entry) => {
                              const isEditing = editingEntryId === entry._id;
                              const isDeleting = deletingEntryId === entry._id;

                              return (
                                <tr
                                  key={entry._id}
                                  className='border-b border-zinc-100 last:border-0 dark:border-zinc-800'
                                >
                                  {isEditing ? (
                                    <>
                                      <td className='py-3 pr-4'>
                                        <select
                                          value={editMemberId}
                                          onChange={(e) =>
                                            setEditMemberId(e.target.value)
                                          }
                                          className='w-full min-w-40 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800'
                                        >
                                          <option value=''>
                                            Select member
                                          </option>

                                          {members.map((member) => (
                                            <option
                                              key={member._id}
                                              value={member._id}
                                            >
                                              {member.fullName}
                                            </option>
                                          ))}
                                        </select>
                                      </td>

                                      <td className='py-3 pr-4'>
                                        <input
                                          type='number'
                                          min='0'
                                          step='0.01'
                                          value={editAmount}
                                          onChange={(e) =>
                                            setEditAmount(e.target.value)
                                          }
                                          className='w-full min-w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800'
                                        />
                                      </td>

                                      <td className='py-3 pr-4'>
                                        <input
                                          type='date'
                                          value={editContributedAt}
                                          onChange={(e) =>
                                            setEditContributedAt(e.target.value)
                                          }
                                          className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800'
                                        />
                                      </td>

                                      <td className='py-3'>
                                        <div className='flex items-center gap-1'>
                                          <button
                                            type='button'
                                            onClick={() =>
                                              handleUpdateEntry(
                                                contribution._id,
                                                entry._id,
                                              )
                                            }
                                            disabled={
                                              savingEdit ||
                                              !editMemberId ||
                                              !editAmount
                                            }
                                            className='rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-950'
                                            title='Save changes'
                                          >
                                            <Check size={17} />
                                          </button>

                                          <button
                                            type='button'
                                            onClick={cancelEditingEntry}
                                            disabled={savingEdit}
                                            className='rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                            title='Cancel'
                                          >
                                            <X size={17} />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className='py-3 pr-4'>
                                        {entry.member?.fullName ||
                                          'Unknown member'}
                                      </td>

                                      <td className='py-3 pr-4 font-medium'>
                                        {formatAmount(entry.amount)}
                                      </td>

                                      <td className='py-3 pr-4 text-zinc-500 dark:text-zinc-400'>
                                        {formatDate(entry.contributedAt)}
                                      </td>

                                      <td className='py-3'>
                                        <div className='flex items-center justify-between gap-2'>
                                          <span className='text-zinc-500 dark:text-zinc-400'>
                                            {formatDate(entry.createdAt)}
                                          </span>
                                        </div>
                                      </td>
                                      <td className='py-3'>
                                        <div className='flex justify-end gap-1'>
                                          <button
                                            type='button'
                                            onClick={() =>
                                              startEditingEntry(entry)
                                            }
                                            className='rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                                            title='Edit contribution'
                                            aria-label='Edit contribution'
                                          >
                                            <Pencil size={16} />
                                          </button>

                                          <button
                                            type='button'
                                            onClick={() =>
                                              handleDeleteEntry(
                                                contribution._id,
                                                entry._id,
                                              )
                                            }
                                            disabled={
                                              deletingEntryId === entry._id
                                            }
                                            className='rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400'
                                            title='Delete contribution'
                                            aria-label='Delete contribution'
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
