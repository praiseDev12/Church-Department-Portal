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

export default ErrorState;
