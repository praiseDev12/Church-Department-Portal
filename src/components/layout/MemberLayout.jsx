import { useEffect, useState } from 'react';

import { Outlet, NavLink } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';

import { useTheme } from '../../context/ThemeContext.jsx';

import { initializeMessaging } from '../../lib/messaging.js';

import NotificationPrompt from '../notifications/NotificationPrompt.jsx';

import InstallAppButton from '../pwa/InstallAppButton.jsx';

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
  Bell,
} from 'lucide-react';

import BrandLockup from '../ui/BrandLockup.jsx';

const navItems = [
  {
    to: '/portal',
    label: 'Home',
    end: true,
    icon: Home,
  },
  {
    to: '/check-in',
    label: 'Check-In',
    icon: CalendarCheck,
  },
  {
    to: '/member/announcements',
    label: 'Announcements',
    icon: Bell,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: UserCircle,
  },
];

const iconButtonBase =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 transition-colors dark:border-zinc-700';

export default function MemberLayout() {
  const { isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);

  // Tracks whether the app is running as an installed PWA.
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    initializeMessaging();
  }, []);

  useEffect(() => {
    const checkDisplayMode = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

      setIsInstalled(standalone);
    };

    checkDisplayMode();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    mediaQuery.addEventListener('change', checkDisplayMode);

    return () => {
      mediaQuery.removeEventListener('change', checkDisplayMode);
    };
  }, []);

  return (
    <div className='flex min-h-screen flex-col bg-white dark:bg-zinc-950'>
      <header className='sticky top-0 z-100 flex items-center justify-between gap-2 border-b border-zinc-200 bg-white/70 px-4 py-3 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/70 sm:px-6'>
        <BrandLockup variant={theme} />

        <div className='flex items-center gap-1.5 sm:gap-2'>
          <InstallAppButton />

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
            type='button'
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
            type='button'
            onClick={logout}
            aria-label='Log out'
            className={`${iconButtonBase} text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}
          >
            <LogOut className='h-4 w-4' />
          </button>

          {/*
            Browser navigation menu.

            This remains available for:
            - Mobile browsers
            - Desktop browsers
            - Desktop installed PWA

            It is hidden when the installed PWA is
            running on a mobile-sized screen.
          */}
          <div className={`relative ${isInstalled ? 'max-sm:hidden' : ''}`}>
            <button
              type='button'
              onClick={() => setMenuOpen((value) => !value)}
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

      {/*
        Floating glass navigation dock.

        Visible ONLY when:
        1. The app is installed as a PWA.
        2. The screen is below the sm breakpoint.

        Normal mobile web does not get this dock.
      */}
      {isInstalled && (
        <nav
          aria-label='Mobile app navigation'
          className='
            fixed bottom-0 left-1/2 z-100
            hidden
            -translate-x-1/2
            pb-[env(safe-area-inset-bottom)]
            max-sm:block
          '
        >
          <div className='mb-3 flex items-center rounded-3xl border border-zinc-200/70 bg-white/85 p-1.5 shadow-xl shadow-zinc-900/10 backdrop-blur-2xl dark:border-zinc-700/70 dark:bg-zinc-900/85 dark:shadow-black/30'>
            <div className='flex items-center gap-1'>
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    aria-label={item.label}
                    className='flex min-w-16 flex-col items-center justify-center rounded-2xl px-2.5 py-2 transition-colors'
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex h-8 w-11 items-center justify-center rounded-xl transition-all ${
                            isActive
                              ? 'bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-200'
                              : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          <Icon
                            className='h-5 w-5'
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                        </span>

                        <span
                          className={`mt-0.5 max-w-17.5 truncate text-[10px] font-medium ${
                            isActive
                              ? 'text-brand-600 dark:text-brand-200'
                              : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/*
        Extra bottom padding prevents page content from
        being hidden behind the floating navigation dock.
      */}
      <main
        className={`flex-1 px-4 py-6 sm:px-6 sm:py-8 ${
          isInstalled ? 'max-sm:pb-28' : ''
        }`}
      >
        <Outlet />
      </main>

      <NotificationPrompt />
    </div>
  );
}
