import { Users } from 'lucide-react';

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

export default EmptyState;
