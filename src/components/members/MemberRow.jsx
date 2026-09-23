import { ChevronRight } from 'lucide-react';

import ActionsMenu from './ActionsMenu.jsx';
import MemberDetails from './MemberDetails.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../../utils/memberUtils.js';

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
  onPhotoClick,
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
        <td className='min-w-0 px-2 py-4 sm:px-3'>
          <div className='flex min-w-0 items-center gap-3'>
            {member.photoUrl ? (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onPhotoClick(member);
                }}
                className='shrink-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40'
                aria-label={`View photo of ${member.fullName}`}
              >
                <img
                  src={member.photoUrl}
                  alt={member.fullName}
                  className='h-10 w-10 rounded-xl object-cover transition-transform hover:scale-105'
                />
              </button>
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
        <td className='hidden text-[10px] md:text-xs lg:text-sm text-nowrap px-5 py-4 text-zinc-600 dark:text-zinc-300 md:table-cell'>
          {joinedDate}
        </td>

        {/* Status */}
        <td className='hidden px-2 py-4 md:table-cell sm:px-3'>
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
        <tr className='border-b border-zinc-200 bg-gray-200 dark:border-zinc-800 dark:bg-zinc-950/30'>
          <td colSpan={7} className='p-3 sm:p-5 lg:p-6'>
            <MemberDetails member={member} />
          </td>
        </tr>
      )}
    </>
  );
}

export default MemberRow;
