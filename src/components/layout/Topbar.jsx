import { Menu, MoonIcon, SunIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className='flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6'>
      <div className='flex min-w-0 items-center gap-3'>
        {/* Sidebar toggle — mobile only. Lives in the header instead of
            floating independently over the page, so it reads as part
            of the app chrome rather than a separate overlay element. */}
        <button
          type='button'
          onClick={onMenuClick}
          aria-label='Open navigation menu'
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden'
        >
          <Menu size={20} />
        </button>

        <p className='truncate text-sm text-zinc-500 dark:text-zinc-400'>
          {user?.department?.name
            ? `${user.department.name} Department`
            : 'Department'}
        </p>
      </div>

      <div className='flex items-center gap-3 sm:gap-5 lg:gap-10'>
        <button
          onClick={toggleTheme}
          aria-label='Toggle color theme'
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
        >
          {theme === 'dark' ? (
            <SunIcon className='size-3 lg:size-5 text-brand dark:text-brand-200' />
          ) : (
            <MoonIcon className='size-3 lg:size-5 text-brand dark:text-brand-200' />
          )}
        </button>
        <div className='text-right'>
          <p className='text-xs font-medium text-brand dark:text-brand-200 lg:text-sm'>
            {user?.fullName}
          </p>
          <p className='text-[10px] text-zinc-500 dark:text-zinc-400 lg:text-xs'>
            {user?.role === 'main_admin' ? 'Main Admin' : 'Unit Admin'}
          </p>
        </div>
      </div>
    </header>
  );
}
