import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import EditMemberModal from '../components/members/EditMemberModal.jsx';
import ChangeUnitModal from '../components/members/ChangeUnitModal.jsx';
import ConfirmDialog from '../components/members/ConfirmDialog.jsx';
import RoleModal from '../components/members/RoleModal.jsx';

import {
  getMembers,
  changeMemberStatus,
  deleteMember,
} from '../services/memberService.js';

import {
  User,
  Phone,
  Users,
  BriefcaseBusiness,
  History,
  ChevronRight,
  MoreVertical,
  Pencil,
  ArrowRightLeft,
  RefreshCw,
  PhoneCall,
  MessageCircle,
  Mail,
  Copy,
  Trash2,
  UserCog,
} from 'lucide-react';

function formatWhatsAppNumber(number) {
  if (!number) return '';

  const cleaned = number.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    return `234${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith('234')) {
    return cleaned;
  }

  return cleaned;
}

function ActionsMenu({
  member,
  onEdit,
  onChangeUnit,
  onChangeStatus,
  onChangeRole,
  onDelete,
  showRoleAction,
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(member._id);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard may not be available in some browsers
    }
  };

  const closeMenu = () => {
    setOpen(false);
  };

  const handleAction = (callback) => {
    closeMenu();
    callback?.();
  };

  return (
    <div className='absolute'>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          setOpen((current) => !current);
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          open
            ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
            : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        }`}
        aria-label={`Actions for ${member.fullName}`}
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          {/* Backdrop for mobile */}
          <div
            className='fixed inset-0 z-40'
            onClick={closeMenu}
            aria-hidden='true'
          />

          <div
            className='absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit */}
            <button
              type='button'
              onClick={() => handleAction(onEdit)}
              className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
            >
              <Pencil size={16} className='shrink-0 text-zinc-400' />

              <span>Edit member</span>
            </button>

            {/* Change unit */}
            <button
              type='button'
              onClick={() => handleAction(onChangeUnit)}
              className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
            >
              <ArrowRightLeft size={16} className='shrink-0 text-zinc-400' />

              <span>Change unit</span>
            </button>

            {/* Change status */}
            <button
              type='button'
              onClick={() => handleAction(onChangeStatus)}
              className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
            >
              <RefreshCw size={16} className='shrink-0 text-zinc-400' />

              <span>
                {member.status === 'active' ? 'Mark inactive' : 'Mark active'}
              </span>
            </button>

            {/* Change role — main admins only */}
            {showRoleAction && (
              <button
                type='button'
                onClick={() => handleAction(onChangeRole)}
                className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
              >
                <UserCog size={16} className='shrink-0 text-zinc-400' />

                <span>Change role</span>
              </button>
            )}

            <div className='my-1 border-t border-zinc-100 dark:border-zinc-800' />

            {/* Call */}
            {member.phoneNumber && (
              <a
                href={`tel:${member.phoneNumber}`}
                onClick={closeMenu}
                className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
              >
                <PhoneCall size={16} className='shrink-0 text-zinc-400' />

                <span>Call member</span>
              </a>
            )}

            {/* WhatsApp */}
            {member.whatsappNumber && (
              <a
                href={`https://wa.me/${formatWhatsAppNumber(member.whatsappNumber)}`}
                target='_blank'
                rel='noreferrer'
                onClick={closeMenu}
                className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
              >
                <MessageCircle size={16} className='shrink-0 text-zinc-400' />

                <span>WhatsApp</span>
              </a>
            )}

            {/* Email */}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                onClick={closeMenu}
                className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
              >
                <Mail size={16} className='shrink-0 text-zinc-400' />

                <span>Send email</span>
              </a>
            )}

            {/* Copy ID */}
            <button
              type='button'
              onClick={handleCopyId}
              className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
            >
              <Copy size={16} className='shrink-0 text-zinc-400' />

              <span>{copied ? 'Copied!' : 'Copy member ID'}</span>
            </button>

            <div className='my-1 border-t border-zinc-100 dark:border-zinc-800' />

            {/* Delete */}
            <button
              type='button'
              onClick={() => handleAction(onDelete)}
              className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
            >
              <Trash2 size={16} className='shrink-0' />

              <span>Delete member</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className='divide-y divide-zinc-100 dark:divide-zinc-800'>
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className='flex items-center gap-3 px-3 py-4 sm:gap-4 sm:px-5'
        >
          <div className='h-8 w-8 shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800' />

          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <div className='h-10 w-10 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800' />

            <div className='min-w-0 flex-1 space-y-2'>
              <div className='h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
              <div className='h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
            </div>
          </div>

          <div className='hidden h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 sm:block' />

          <div className='hidden h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 md:block' />

          <div className='h-6 w-16 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800' />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/30'>
        <span className='text-lg font-bold'>!</span>
      </div>

      <h3 className='text-sm font-semibold text-zinc-900 dark:text-white'>
        Unable to load members
      </h3>

      <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
        {error}
      </p>
    </div>
  );
}

function EmptyState({ search }) {
  return (
    <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
      <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
        <Users size={26} />
      </div>

      <h3 className='text-sm font-semibold text-zinc-900 dark:text-white'>
        {search ? 'No members found' : 'No members yet'}
      </h3>

      <p className='mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
        {search
          ? `We couldn't find any members matching "${search}"`
          : 'Add a member or import your existing members to get started.'}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEnum(value) {
  if (!value) return '—';

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ status }) {
  const isActive = status === 'active';

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-zinc-400'
        }`}
      />

      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function UserIcon() {
  return <User size={16} />;
}

function PhoneIcon() {
  return <Phone size={16} />;
}

function UsersIcon() {
  return <Users size={16} />;
}

function BriefcaseIcon() {
  return <BriefcaseBusiness size={16} />;
}

function HistoryIcon() {
  return <History size={16} />;
}

function InfoSection({ title, icon, children }) {
  return (
    <div className='min-w-0 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='mb-4 flex items-center gap-2'>
        <div className='shrink-0 text-zinc-400 dark:text-zinc-500'>{icon}</div>

        <h3 className='text-sm font-semibold text-zinc-900 dark:text-white'>
          {title}
        </h3>
      </div>

      <div className='space-y-3'>{children}</div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className='flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
      <span className='shrink-0 text-xs text-zinc-500 dark:text-zinc-400'>
        {label}
      </span>

      <span className='min-w-0 wrap-break-word text-left text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:text-right'>
        {value || '—'}
      </span>
    </div>
  );
}

function UnitHistory({ member }) {
  const history = member.unitHistory || [];

  return (
    <div className='min-w-0 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='mb-4 flex items-center gap-2'>
        <div className='shrink-0 text-zinc-400 dark:text-zinc-500'>
          <HistoryIcon />
        </div>

        <div className='min-w-0'>
          <h3 className='text-sm font-semibold text-zinc-900 dark:text-white'>
            Unit History
          </h3>

          <p className='text-xs text-zinc-500 dark:text-zinc-400'>
            Previous unit movements
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className='rounded-lg bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400'>
          No unit movement history
        </div>
      ) : (
        <div className='relative space-y-4'>
          {history.map((item, index) => (
            <div
              key={`${item.unit?._id || index}-${index}`}
              className='relative flex gap-3 sm:gap-4'
            >
              <div className='relative flex shrink-0 flex-col items-center'>
                <div className='mt-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/10' />

                {index !== history.length - 1 && (
                  <div className='mt-1 h-full w-px bg-zinc-200 dark:bg-zinc-700' />
                )}
              </div>

              <div className='min-w-0 pb-4'>
                <p className='wrap-break-word text-sm font-medium text-zinc-900 dark:text-white'>
                  {item.unit?.name || 'Unknown unit'}
                </p>

                <p className='mt-0.5 wrap-break-word text-xs text-zinc-500 dark:text-zinc-400'>
                  {formatDate(item.movedAt)}
                  {item.movedBy?.fullName
                    ? ` · Moved by ${item.movedBy.fullName}`
                    : ''}
                </p>

                {item.note && (
                  <p className='mt-2 wrap-break-word text-sm text-zinc-600 dark:text-zinc-300'>
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberDetails({ member }) {
  const initials = member.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  return (
    <div className='mx-auto min-w-0 max-w-6xl'>
      {/* Profile header */}
      <div className='mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.fullName}
              className='h-14 w-14 shrink-0 rounded-2xl object-cover ring-4 ring-white dark:ring-zinc-900 sm:h-16 sm:w-16'
            />
          ) : (
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 sm:h-16 sm:w-16 sm:text-xl'>
              {initials || '?'}
            </div>
          )}

          <div className='min-w-0'>
            <div className='flex min-w-0 flex-wrap items-center gap-2'>
              <h2 className='max-w-full wrap-break-word text-lg font-semibold text-zinc-900 dark:text-white'>
                {member.fullName}
              </h2>

              <StatusBadge status={member.status} />
            </div>

            <p className='mt-1 wrap-break-word text-sm text-zinc-500 dark:text-zinc-400'>
              {member.roleInUnit || 'Member'}
              {member.unit?.name ? ` · ${member.unit.name}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Information sections */}
      <div className='grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <InfoSection title='Personal Information' icon={<UserIcon />}>
          <InfoItem label='Full Name' value={member.fullName} />

          <InfoItem
            label='Date of Birth'
            value={formatDate(member.dateOfBirth)}
          />

          <InfoItem label='Gender' value={formatEnum(member.gender)} />

          <InfoItem
            label='Marital Status'
            value={formatEnum(member.maritalStatus)}
          />
        </InfoSection>

        <InfoSection title='Contact Information' icon={<PhoneIcon />}>
          <InfoItem label='Phone Number' value={member.phoneNumber} />

          <InfoItem label='WhatsApp' value={member.whatsappNumber} />

          <InfoItem label='Email' value={member.email} />

          <InfoItem label='Address' value={member.address} />
        </InfoSection>

        <InfoSection title='Membership' icon={<UsersIcon />}>
          <InfoItem label='Department' value={member.department?.name} />

          <InfoItem label='Unit' value={member.unit?.name} />

          <InfoItem label='Role in Unit' value={member.roleInUnit} />

          <InfoItem
            label='Date Joined'
            value={formatDate(member.dateJoinedDepartment)}
          />
        </InfoSection>

        <InfoSection title='Additional Information' icon={<BriefcaseIcon />}>
          <InfoItem label='Occupation' value={member.occupation} />

          <InfoItem label='Status' value={formatEnum(member.status)} />

          <InfoItem label='Registered' value={formatDate(member.createdAt)} />

          <InfoItem label='Last Updated' value={formatDate(member.updatedAt)} />
        </InfoSection>

        <div className='min-w-0 md:col-span-2'>
          <UnitHistory member={member} />
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  isExpanded,
  onToggle,
  onEdit,
  onChangeUnit,
  onChangeStatus,
  onChangeRole,
  onDelete,
  showRoleAction,
}) {
  const initials = member.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  const joinedDate = formatDate(member.dateJoinedDepartment);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`group cursor-pointer border-b border-zinc-100 transition-colors dark:border-zinc-800 ${
          isExpanded
            ? 'bg-zinc-50 dark:bg-zinc-800/40'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
        }`}
      >
        {/* Expand */}
        <td className='w-10 px-2 py-4 sm:px-3'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
            aria-label={
              isExpanded
                ? `Collapse ${member.fullName}`
                : `Expand ${member.fullName}`
            }
          >
            <ChevronRight
              size={17}
              className={`transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        </td>

        {/* Member */}
        <td className='px-2 py-4 sm:px-3'>
          <div className='flex min-w-0 items-center gap-3'>
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt=''
                className='h-10 w-10 shrink-0 rounded-xl object-cover'
              />
            ) : (
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'>
                {initials || '?'}
              </div>
            )}

            <div className='min-w-0'>
              <p className='truncate font-medium text-zinc-900 dark:text-white'>
                {member.fullName}
              </p>

              {member.email && (
                <p className='truncate text-xs text-zinc-500 dark:text-zinc-400'>
                  {member.email}
                </p>
              )}
            </div>
          </div>
        </td>

        {/* Unit */}
        <td className='hidden min-w-0 px-5 py-4 sm:table-cell'>
          {member.unit?.name ? (
            <span className='inline-flex max-w-full truncate rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'>
              {member.unit.name}
            </span>
          ) : (
            <span className='text-zinc-400'>Unassigned</span>
          )}
        </td>

        {/* Phone */}
        <td className='hidden min-w-0 px-5 py-4 md:table-cell'>
          <span className='block truncate text-zinc-600 dark:text-zinc-300'>
            {member.phoneNumber || '—'}
          </span>
        </td>

        {/* Joined */}
        <td className='hidden px-5 py-4 text-zinc-600 dark:text-zinc-300 lg:table-cell'>
          {joinedDate}
        </td>

        {/* Status */}
        <td className='hidden lg:block px-2 py-4 sm:px-3'>
          <StatusBadge status={member.status} />
        </td>

        {/* Actions */}
        <td className='w-10 px-2 py-4 sm:px-3'>
          <ActionsMenu
            member={member}
            onEdit={onEdit}
            onChangeUnit={onChangeUnit}
            onChangeStatus={onChangeStatus}
            onChangeRole={onChangeRole}
            onDelete={onDelete}
            showRoleAction={showRoleAction}
          />
        </td>
      </tr>

      {/* Expanded member details */}
      {isExpanded && (
        <tr className='border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/30'>
          <td colSpan={7} className='p-3 sm:p-5 lg:p-6'>
            <MemberDetails member={member} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function Members() {
  const { isMainAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState(null);

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
        });

        if (!cancelled) {
          setMembers(data.members || []);
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
  }, [search]);

  const toggleMember = (memberId) => {
    setExpandedMemberId((current) => (current === memberId ? null : memberId));
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

        <div className='flex w-full gap-2 sm:w-auto'>
          <Button variant='secondary' className='flex-1 sm:flex-none'>
            Import CSV
          </Button>

          <Button className='flex-1 sm:flex-none'>Add member</Button>
        </div>
      </div>

      {/* Search */}
      <div className='w-full'>
        <input
          type='search'
          placeholder='Search members...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800'
        />
      </div>

      {actionError && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400'>
          {actionError}
        </div>
      )}

      {/* Members table */}
      <Card className='w-full min-w-0 overflow-hidden border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : members.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className='w-full min-w-0 overflow-x-hidden'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/40'>
                  <th className='w-10 px-2 py-3.5 sm:px-3'>
                    <span className='sr-only'>Expand</span>
                  </th>

                  <th className='px-2 py-3.5 font-medium text-zinc-500 dark:text-zinc-400 sm:px-3'>
                    Member
                  </th>

                  <th className='hidden px-5 py-3.5 font-medium text-zinc-500 dark:text-zinc-400 sm:table-cell'>
                    Unit
                  </th>

                  <th className='hidden px-5 py-3.5 font-medium text-zinc-500 dark:text-zinc-400 md:table-cell'>
                    Phone
                  </th>

                  <th className='hidden px-5 py-3.5 font-medium text-zinc-500 dark:text-zinc-400 lg:table-cell'>
                    Joined
                  </th>

                  <th className='hidden lg:block px-2 py-3.5 font-medium text-zinc-500 dark:text-zinc-400 sm:px-3'>
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
                    />
                  );
                })}
              </tbody>
            </table>
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
