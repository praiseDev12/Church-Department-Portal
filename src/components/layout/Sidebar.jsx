import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import BrandLockup from '../ui/BrandLockup.jsx';

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

const linkActive = 'bg-brand-500 text-white';

const linkInactive =
  'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/members', label: 'Members' },
  { to: '/check-in', label: 'Check-In' },
  { to: '/admin-checkin', label: 'Setup Check In', mainAdminOnly: true },
  { to: '/contributions', label: 'Contributions' },
  { to: '/attendance', label: 'Attendance', mainAdminOnly: true },
  { to: '/reports', label: 'Reports' },
  { to: '/units', label: 'Units', mainAdminOnly: true },
  { to: '/audit-log', label: 'Audit Log', mainAdminOnly: true },
];

export default function Sidebar() {
  const { isMainAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const visibleNavItems = navItems.filter(
    (item) => !item.mainAdminOnly || isMainAdmin,
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='fixed left-0 top-9 z-40 rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm md:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
        aria-label='Open navigation menu'
      >
        <ChevronRight size={24} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 md:hidden'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-zinc-200 bg-white p-4 shadow-xl transition-transform duration-300 md:hidden dark:border-zinc-800 dark:bg-zinc-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className='mb-6 flex items-center justify-between px-2'>
          <BrandLockup variant='light' />

          <button
            type='button'
            onClick={() => setIsOpen(false)}
            className='rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white'
            aria-label='Close navigation menu'
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex flex-1 flex-col gap-1'>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className='hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex'>
        <div className='mb-6 px-2'>
          <BrandLockup variant='light' />
        </div>

        <nav className='flex flex-1 flex-col gap-1'>
          {visibleNavItems.map((item) => (
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
      </aside>
    </>
  );
}
