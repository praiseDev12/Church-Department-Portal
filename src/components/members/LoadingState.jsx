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

export default LoadingState;
