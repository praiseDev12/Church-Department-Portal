import { useEffect, useState } from 'react';

import { NavLink, Outlet } from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarCheck,
  MoreHorizontal,
  Settings,
  Bell,
  HandCoins,
  FileBarChart,
  Building2,
  X,
  LogOut,
} from 'lucide-react';

import Sidebar from './Sidebar.jsx';

import Topbar from './Topbar.jsx';

import NotificationPrompt from '../notifications/NotificationPrompt.jsx';

import { initializeMessaging } from '../../lib/messaging.js';

import { useAuth } from '../../context/AuthContext.jsx';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

const moreNavItems = [
  {
    to: '/admin-checkin',
    label: 'Setup Check In',
    icon: Settings,
  },
  {
    to: '/announcements',
    label: 'Announcement',
    icon: Bell,
  },
  {
    to: '/contributions',
    label: 'Contributions',
    icon: HandCoins,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: FileBarChart,
  },
  {
    to: '/units',
    label: 'Units',
    icon: Building2,
  },
];

export default function AppLayout() {
  const { isMainAdmin, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  const [isInstalled, setIsInstalled] = useState(false);

  const [moreOpen, setMoreOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const nextValue = !current;

      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));

      return nextValue;
    });
  };

  useEffect(() => {
    initializeMessaging();
  }, []);

  // Detect whether the app is running as an installed PWA.
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

  // Close the More menu when the user leaves
  // the installed mobile navigation.
  useEffect(() => {
    if (!isInstalled || !isMainAdmin) {
      setMoreOpen(false);
    }
  }, [isInstalled, isMainAdmin]);

  return (
    <div className='flex min-h-dvh min-w-0 bg-white dark:bg-zinc-900 dark:text-white'>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isInstalled={isInstalled}
      />

      <div className='flex min-w-0 flex-1 flex-col'>
        <Topbar
          isInstalled={isInstalled}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main
          className={`min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 ${
            isInstalled ? 'max-sm:pb-28' : ''
          }`}
        >
          <Outlet />
        </main>

        <NotificationPrompt />
      </div>

      {/* Installed PWA mobile navigation */}
      {isInstalled && (
        <nav
          aria-label='Admin mobile app navigation'
          className='fixed bottom-0 left-1/2 z-100 hidden -translate-x-1/2 pb-[env(safe-area-inset-bottom)] max-sm:block'
        >
          <div className='relative'>
            {/* More menu */}
            {isMainAdmin && moreOpen && (
              <div className='absolute bottom-full right-0 mb-3 w-56 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/95 p-2 shadow-xl shadow-zinc-900/10 backdrop-blur-2xl dark:border-zinc-700/70 dark:bg-zinc-900/95 dark:shadow-black/30'>
                <div className='mb-1 flex items-center justify-between px-2 py-1'>
                  <span className='text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400'>
                    More
                  </span>

                  <button
                    type='button'
                    onClick={() => setMoreOpen(false)}
                    className='rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    aria-label='Close more menu'
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className='flex flex-col gap-1'>
                  {moreNavItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-brand-500 text-white'
                              : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                          }`
                        }
                      >
                        <Icon size={18} />

                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                  <div className='my-1 border-t border-zinc-100 dark:border-zinc-800' />

                  <button
                    type='button'
                    onClick={logout}
                    className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                  >
                    <LogOut size={18} />

                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Floating glass dock */}
            <div className='mb-3 flex items-center rounded-3xl border border-zinc-200/70 bg-white/85 p-1.5 shadow-xl shadow-zinc-900/10 backdrop-blur-2xl dark:border-zinc-700/70 dark:bg-zinc-900/85 dark:shadow-black/30'>
              <div className='flex items-center gap-1'>
                <NavLink
                  to='/'
                  end
                  className={({ isActive }) =>
                    `flex size-11 items-center justify-center rounded-2xl transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`
                  }
                  aria-label='Dashboard'
                  title='Dashboard'
                >
                  <LayoutDashboard size={19} />
                </NavLink>

                <NavLink
                  to='/members'
                  className={({ isActive }) =>
                    `flex size-11 items-center justify-center rounded-2xl transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`
                  }
                  aria-label='Members'
                  title='Members'
                >
                  <Users size={19} />
                </NavLink>

                <NavLink
                  to='/check-in'
                  className={({ isActive }) =>
                    `flex size-11 items-center justify-center rounded-2xl transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`
                  }
                  aria-label='Check-In'
                  title='Check-In'
                >
                  <ClipboardCheck size={19} />
                </NavLink>

                <NavLink
                  to='/attendance'
                  className={({ isActive }) =>
                    `flex size-11 items-center justify-center rounded-2xl transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`
                  }
                  aria-label='Attendance'
                  title='Attendance'
                >
                  <CalendarCheck size={19} />
                </NavLink>

                {isMainAdmin && (
                  <button
                    type='button'
                    onClick={() => setMoreOpen((current) => !current)}
                    className={`flex size-11 items-center justify-center rounded-2xl transition-colors ${
                      moreOpen
                        ? 'bg-brand-500 text-white'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                    aria-label='More navigation options'
                    title='More'
                    aria-expanded={moreOpen}
                  >
                    <MoreHorizontal size={21} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
