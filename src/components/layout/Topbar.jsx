import { LogOut, MoonIcon, SunIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Button from '../ui/Button.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className='flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900'>
      <div>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          {user?.departmentName ?? 'Department'}
        </p>
      </div>
      <div className='flex items-center gap-3 lg:gap-10'>
        <button
          onClick={toggleTheme}
          aria-label='Toggle color theme'
          className='rounded-full border border-brand  flex-center p-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
        >
          {theme === 'dark' ? (
            <SunIcon className='size-3 lg:size-5 text-brand dark:text-brand-200' />
          ) : (
            <MoonIcon className='size-3 lg:size-5 text-brand dark:text-brand-200' />
          )}
        </button>
        <div className='text-right'>
          <p className='text-xs lg:text-sm font-medium text-brand dark:text-brand-200'>
            {user?.name}
          </p>
          <p className='text-[10px] lg:text-xs text-zinc-500 dark:text-zinc-400'>
            {user?.role === 'main_admin' ? 'Main Admin' : 'Unit Admin'}
          </p>
        </div>
        <button onClick={logout}>
          <LogOut className='size-3 text-red-300 hover:text-red-500' />
        </button>
      </div>
    </header>
  );
}
