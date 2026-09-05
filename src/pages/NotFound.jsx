import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Not Found';
  }, []);
  return (
    <div className='flex h-screen flex-col items-center justify-center gap-2'>
      <p className='font-display text-4xl font-semibold text-brand-500 dark:text-brand-300'>
        404
      </p>
      <p className='text-zinc-500 dark:text-zinc-400'>Page not found.</p>
      <Link
        to='/'
        className='text-sm text-brand-500 hover:underline dark:text-brand-300'
      >
        Back to dashboard
      </Link>
    </div>
  );
}
