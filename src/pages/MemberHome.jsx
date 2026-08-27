import { useMemberAuth } from '../context/MemberAuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Button from '../components/ui/Button.jsx';
import { LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';

export default function MemberHome() {
  const { member, logout } = useMemberAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className='flex min-h-screen flex-col bg-white dark:bg-zinc-950'>
      <header className='flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800'>
        <p className='font-display text-lg font-semibold text-brand-500 dark:text-brand-300'>
          Department Portal
        </p>
        <div className='flex items-center gap-3 lg:gap-9'>
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

          <button onClick={logout}>
            <LogOutIcon className='size-3 lg:size-5 text-red-500' />
          </button>
        </div>
      </header>

      <main className='flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center'>
        <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
          Welcome, {member?.fullName}
        </h1>
        <p className='max-w-sm text-sm text-zinc-500 dark:text-zinc-400'>
          Service check-in will appear here once it's turned on for your
          department.
        </p>
      </main>
    </div>
  );
}
