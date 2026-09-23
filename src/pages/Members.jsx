import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import EditMemberModal from '../components/members/EditMemberModal.jsx';
import ChangeUnitModal from '../components/members/ChangeUnitModal.jsx';
import ConfirmDialog from '../components/members/ConfirmDialog.jsx';
import RoleModal from '../components/members/RoleModal.jsx';

import {
  getMembers,
  changeMemberStatus,
  deleteMember,
} from '../services/memberService.js';

import LoadingState from '../components/members/LoadingState.jsx';
import ErrorState from '../components/members/ErrorState.jsx';
import EmptyState from '../components/members/EmptyState.jsx';
import PhotoPreviewModal from '../components/members/PhotoPreviewModal.jsx';
import MemberRow from '../components/members/MemberRow.jsx';
import MobileMemberRow from '../components/members/MobileMemberRow.jsx';

export default function Members() {
  const { isMainAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  const limit = 20;

  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalMembers: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [previewMember, setPreviewMember] = useState(null);

  const [editingMember, setEditingMember] = useState(null);
  const [unitChangeMember, setUnitChangeMember] = useState(null);
  const [roleChangeMember, setRoleChangeMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchMembers() {
      try {
        setLoading(true);
        setError('');

        const data = await getMembers({
          search,
          page,
          limit,
        });

        if (!cancelled) {
          setMembers(data.members || []);

          setPagination(
            data.pagination || {
              page,
              limit,
              totalMembers: 0,
              totalPages: 0,
            },
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load members');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [search, page, limit]);

  const toggleMember = (memberId) => {
    setExpandedMemberId((current) => (current === memberId ? null : memberId));
  };

  const goToPage = (nextPage) => {
    const safePage = Math.max(
      1,
      Math.min(nextPage, pagination.totalPages || 1),
    );

    setSearchParams((current) => {
      const params = new URLSearchParams(current);

      if (safePage === 1) {
        params.delete('page');
      } else {
        params.set('page', String(safePage));
      }

      return params;
    });
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      goToPage(page - 1);
    }
  };

  const goToNextPage = () => {
    if (page < pagination.totalPages) {
      goToPage(page + 1);
    }
  };

  function patchMember(updatedMember) {
    setMembers((current) =>
      current.map((m) => (m._id === updatedMember._id ? updatedMember : m)),
    );
  }

  function handleEdit(member) {
    setActionError('');
    setEditingMember(member);
  }

  function handleChangeUnit(member) {
    setActionError('');
    setUnitChangeMember(member);
  }

  function handleChangeRole(member) {
    setActionError('');
    setRoleChangeMember(member);
  }

  async function handleChangeStatus(member) {
    setActionError('');
    const nextStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      const data = await changeMemberStatus(member._id, nextStatus);
      patchMember(data.member);
    } catch (err) {
      setActionError(err.message || 'Could not update member status.');
    }
  }

  function handleDeleteRequest(member) {
    setActionError('');
    setDeleteTarget(member);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMember(deleteTarget._id);
      setMembers((current) =>
        current.filter((m) => m._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
    } catch (err) {
      setActionError(err.message || 'Could not delete member.');
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleMemberSaved(updatedMember) {
    patchMember(updatedMember);
    setEditingMember(null);
    setUnitChangeMember(null);
    setRoleChangeMember(null);
  }

  useEffect(() => {
    document.title = 'Members - Department Management';
  }, []);

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      {/* Page header */}
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
            Members
          </h1>

          <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
            Manage and view your department members
          </p>
        </div>
      </div>

      {/* Search */}
      <div className='w-full'>
        <input
          type='search'
          placeholder='Search members...'
          value={search}
          onChange={(e) => {
            const value = e.target.value;

            setSearchParams((current) => {
              const params = new URLSearchParams(current);

              if (value.trim()) {
                params.set('search', value);
              } else {
                params.delete('search');
              }

              params.set('page', '1');

              return params;
            });
          }}
          className='w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800'
        />
      </div>

      {actionError && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400'>
          {actionError}
        </div>
      )}

      {/* Members table */}
      <Card className='w-full min-w-0 border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : members.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <>
            {/* Mobile members list */}
            <div className='md:hidden'>
              {members.map((member) => {
                const isExpanded = expandedMemberId === member._id;

                return (
                  <MobileMemberRow
                    key={member._id}
                    member={member}
                    isExpanded={isExpanded}
                    onToggle={() => toggleMember(member._id)}
                    onEdit={() => handleEdit(member)}
                    onChangeUnit={() => handleChangeUnit(member)}
                    onChangeStatus={() => handleChangeStatus(member)}
                    onChangeRole={() => handleChangeRole(member)}
                    onDelete={() => handleDeleteRequest(member)}
                    showRoleAction={isMainAdmin}
                    onPhotoClick={setPreviewMember}
                  />
                );
              })}
            </div>

            {/* Desktop members table */}
            <div className='hidden w-full min-w-0 md:block'>
              <table className='w-full table-fixed text-left text-sm'>
                <thead>
                  <tr className='border border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/40'>
                    <th className='w-10 px-2 py-3.5 sm:px-3'>
                      <span className='sr-only'>Expand</span>
                    </th>

                    <th className='w-[30%] px-2 py-3.5 font-medium text-zinc-500 dark:text-zinc-400 sm:px-3'>
                      Member
                    </th>

                    <th className='w-[18%] px-4 py-3.5 font-medium text-zinc-500 dark:text-zinc-400'>
                      Unit
                    </th>

                    <th className='w-[18%] px-4 py-3.5 font-medium text-zinc-500 dark:text-zinc-400'>
                      Phone
                    </th>

                    <th className='w-[14%] px-4 py-3.5 font-medium text-zinc-500 dark:text-zinc-400'>
                      Joined
                    </th>

                    <th className='w-[14%] px-2 py-3.5 font-medium text-zinc-500 dark:text-zinc-400 sm:px-3'>
                      Status
                    </th>

                    <th className='w-10 px-2 py-3.5 sm:px-3'>
                      <span className='sr-only'>Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member) => {
                    const isExpanded = expandedMemberId === member._id;

                    return (
                      <MemberRow
                        key={member._id}
                        member={member}
                        isExpanded={isExpanded}
                        onToggle={() => toggleMember(member._id)}
                        onEdit={() => handleEdit(member)}
                        onChangeUnit={() => handleChangeUnit(member)}
                        onChangeStatus={() => handleChangeStatus(member)}
                        onChangeRole={() => handleChangeRole(member)}
                        onDelete={() => handleDeleteRequest(member)}
                        showRoleAction={isMainAdmin}
                        onPhotoClick={setPreviewMember}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && !error && pagination.totalMembers > 0 && (
          <div className='flex flex-col gap-3 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              Showing{' '}
              <span className='font-medium text-zinc-700 dark:text-zinc-200'>
                {(page - 1) * limit + 1}
              </span>{' '}
              to{' '}
              <span className='font-medium text-zinc-700 dark:text-zinc-200'>
                {Math.min(page * limit, pagination.totalMembers)}
              </span>{' '}
              of{' '}
              <span className='font-medium text-zinc-700 dark:text-zinc-200'>
                {pagination.totalMembers}
              </span>{' '}
              members
            </p>

            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={goToPreviousPage}
                disabled={page === 1}
                className='rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
              >
                Previous
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type='button'
                  onClick={() => goToPage(pageNumber)}
                  className={`hidden h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition sm:flex ${
                    pageNumber === page
                      ? 'bg-brand-500 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type='button'
                onClick={goToNextPage}
                disabled={page >= pagination.totalPages}
                className='rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={handleMemberSaved}
          onPhotoChanged={patchMember}
        />
      )}

      {roleChangeMember && (
        <RoleModal
          member={roleChangeMember}
          onClose={() => setRoleChangeMember(null)}
          onSaved={handleMemberSaved}
        />
      )}

      {unitChangeMember && (
        <ChangeUnitModal
          member={unitChangeMember}
          onClose={() => setUnitChangeMember(null)}
          onSaved={handleMemberSaved}
        />
      )}

      {previewMember && (
        <PhotoPreviewModal
          member={previewMember}
          onClose={() => setPreviewMember(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title='Delete member'
        message={
          deleteTarget
            ? `Remove ${deleteTarget.fullName} from your department? This can't be undone.`
            : ''
        }
        confirmLabel='Delete'
        danger
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
