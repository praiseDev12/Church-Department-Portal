import { NavLink } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';

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
  { to: '/contributions', label: 'Contributions', mainAdminOnly: true },
  { to: '/attendance', label: 'Attendance', mainAdminOnly: true },
  { to: '/reports', label: 'Reports' },
  { to: '/units', label: 'Units', mainAdminOnly: true },
];

function LogoutButton({ onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-red-500/10 dark:hover:text-red-400'
    >
      <LogOut size={18} />
      Log out
    </button>
  );
}

export default function Sidebar({ open, onClose }) {
  const { isMainAdmin, logout } = useAuth();

  const visibleNavItems = navItems.filter(
    (item) => !item.mainAdminOnly || isMainAdmin,
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className='fixed inset-0 z-40 bg-black/50 md:hidden'
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-zinc-200 bg-white p-4 shadow-xl transition-transform duration-300 md:hidden dark:border-zinc-800 dark:bg-zinc-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className='mb-6 flex items-center justify-between px-2'>
          <BrandLockup variant='light' />

          <button
            type='button'
            onClick={onClose}
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
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout — pinned to the bottom, below the nav's flex-1 */}
        <div className='border-t border-zinc-100 pt-2 dark:border-zinc-800'>
          <LogoutButton onClick={logout} />
        </div>
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

        <div className='border-t border-zinc-100 pt-2 dark:border-zinc-800'>
          <LogoutButton onClick={logout} />
        </div>
      </aside>
    </>
  );
}
