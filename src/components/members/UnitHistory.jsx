import { HistoryIcon } from 'lucide-react';
import { formatDate } from '../../utils/memberUtils';

function UnitHistory({ member }) {
  const history = member.unitHistory || [];

  return (
    <div className='min-w-0 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='mb-4 flex items-center gap-2'>
        <div className='shrink-0 text-zinc-400 dark:text-zinc-500'>
          <HistoryIcon size={16} />
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

export default UnitHistory;
