import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Button from '../ui/Button.jsx';

const navItems = [
  { to: '/portal', label: 'Home', end: true },
  { to: '/check-in', label: 'Check-In' },
  { to: '/profile', label: 'Profile' },
];

const linkBase = 'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors';
const linkActive = 'bg-brand-500 text-white';
const linkInactive =
  'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800';

export default function MemberLayout() {
  const { isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className='flex min-h-screen flex-col bg-white dark:bg-zinc-950'>
      <header className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-6 py-3 dark:border-zinc-800'>
        <p className='font-display text-lg font-semibold text-brand-500 dark:text-brand-300'>
          Department Portal
        </p>

        <nav className='flex items-center gap-1'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className='flex items-center gap-3'>
          {isAdmin && (
            <NavLink
              to='/'
              className='text-sm font-medium text-brand-500 hover:underline dark:text-brand-300'
            >
              Admin dashboard
            </NavLink>
          )}
          <button
            onClick={toggleTheme}
            aria-label='Toggle color theme'
            className='rounded-lg p-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <Button variant='secondary' onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className='flex-1 px-4 py-8 sm:px-6'>
        <Outlet />
      </main>
    </div>
  );
}
