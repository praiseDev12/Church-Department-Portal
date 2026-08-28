import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/40'
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='font-display text-lg font-semibold text-zinc-900 dark:text-white'>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label='Close'
            className='rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
