import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  LogOut,
  MoonIcon,
  SunIcon,
  LayoutDashboard,
  Menu,
  X,
  Home,
  CalendarCheck,
  UserCircle,
} from 'lucide-react';

const navItems = [
  { to: '/portal', label: 'Home', end: true, icon: Home },
  { to: '/check-in', label: 'Check-In', icon: CalendarCheck },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const iconButtonBase =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 transition-colors dark:border-zinc-700';

export default function MemberLayout() {
  const { isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className='flex min-h-screen flex-col bg-white dark:bg-zinc-950'>
      <header className='flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6'>
        <p className='truncate font-display text-base font-semibold text-brand-500 dark:text-brand-300 sm:text-lg'>
          Department Portal
        </p>

        <div className='flex items-center gap-1.5 sm:gap-2'>
          {isAdmin && (
            <NavLink
              to='/'
              aria-label='Admin dashboard'
              className={`${iconButtonBase} text-brand-500 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-zinc-800`}
            >
              <LayoutDashboard className='h-4 w-4' />
            </NavLink>
          )}

          <button
            onClick={toggleTheme}
            aria-label='Toggle color theme'
            className={`${iconButtonBase} text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800`}
          >
            {theme === 'dark' ? (
              <SunIcon className='h-4 w-4' />
            ) : (
              <MoonIcon className='h-4 w-4' />
            )}
          </button>

          <button
            onClick={logout}
            aria-label='Log out'
            className={`${iconButtonBase} text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}
          >
            <LogOut className='h-4 w-4' />
          </button>

          {/* Nav lives in a menu now instead of its own row — same
              toggle + backdrop + panel pattern as ActionsMenu on the
              Members page, for consistency. */}
          <div className='relative'>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label='Open navigation menu'
              aria-expanded={menuOpen}
              className={`${iconButtonBase} ${
                menuOpen
                  ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {menuOpen ? (
                <X className='h-4 w-4' />
              ) : (
                <Menu className='h-4 w-4' />
              )}
            </button>

            {menuOpen && (
              <>
                <div
                  className='fixed inset-0 z-30'
                  onClick={() => setMenuOpen(false)}
                  aria-hidden='true'
                />
                <div className='absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900'>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-brand-500 text-white'
                              : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
                          }`
                        }
                      >
                        <Icon className='h-4 w-4' />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className='flex-1 px-4 py-6 sm:px-6 sm:py-8'>
        <Outlet />
      </main>
    </div>
  );
}
