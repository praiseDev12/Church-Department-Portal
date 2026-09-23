import { ChevronRight } from 'lucide-react';
import ActionsMenu from './ActionsMenu';
import MemberDetails from './MemberDetails';

function MobileMemberRow({
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

  return (
    <div className='border-b border-zinc-100 last:border-b-0 dark:border-zinc-800'>
      <div
        onClick={onToggle}
        className={`flex min-w-0 cursor-pointer items-center gap-3 px-3 py-3.5 transition-colors ${
          isExpanded
            ? 'bg-zinc-50 dark:bg-zinc-800/40'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
        }`}
      >
        {/* Avatar */}
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
              className='h-11 w-11 rounded-xl object-cover transition-transform hover:scale-105'
            />
          </button>
        ) : (
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'>
            {initials || '?'}
          </div>
        )}

        {/* Member information */}
        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-center gap-2'>
            <p className='min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-white'>
              {member.fullName}
            </p>
          </div>

          <div className='mt-1 flex min-w-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400'>
            <span className='truncate'>
              {member.unit?.name || 'Unassigned'}
            </span>

            {member.phoneNumber && (
              <>
                <span className='shrink-0'>·</span>
                <span className='shrink-0'>{member.phoneNumber}</span>
              </>
            )}
          </div>
        </div>

        {/* Expand */}
        <ChevronRight
          size={18}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />

        {/* Actions */}
        <div className='relative shrink-0' onClick={(e) => e.stopPropagation()}>
          <ActionsMenu
            member={member}
            onEdit={onEdit}
            onChangeUnit={onChangeUnit}
            onChangeStatus={onChangeStatus}
            onChangeRole={onChangeRole}
            onDelete={onDelete}
            showRoleAction={showRoleAction}
          />
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className='border-t border-zinc-100 bg-zinc-50/50 px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950/30'>
          <MemberDetails member={member} />
        </div>
      )}
    </div>
  );
}

export default MobileMemberRow;
