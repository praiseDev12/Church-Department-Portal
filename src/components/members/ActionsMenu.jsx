import { useState } from 'react';
import {
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
import { formatWhatsAppNumber } from '../../utils/memberUtils';

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
    <div className='relative'>
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
            className='absolute right-5 top-full lg:-top-10 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30'
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
            {showRoleAction && (
              <button
                type='button'
                onClick={() => handleAction(onChangeUnit)}
                className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
              >
                <ArrowRightLeft size={16} className='shrink-0 text-zinc-400' />

                <span>Change unit</span>
              </button>
            )}

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

export default ActionsMenu;
