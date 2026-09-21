import { NavLink } from 'react-router-dom';
import { logo } from '../../assets/index.js';

import {
  X,
  LogOut,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Settings,
  CalendarCheck,
  HandCoins,
  FileBarChart,
  Building2,
  PanelLeftClose,
  ChevronsRight,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';

import BrandLockup from '../ui/BrandLockup.jsx';

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

const linkActive = 'bg-brand-500 text-white';

const linkInactive =
  'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: LayoutDashboard,
  },
  {
    to: '/members',
    label: 'Members',
    icon: Users,
  },
  {
    to: '/check-in',
    label: 'Check-In',
    icon: ClipboardCheck,
  },
  {
    to: '/admin-checkin',
    label: 'Setup Check In',
    mainAdminOnly: true,
    icon: Settings,
  },
  {
    to: '/attendance',
    label: 'Attendance',
    mainAdminOnly: false,
    icon: CalendarCheck,
  },
  {
    to: '/contributions',
    label: 'Contributions',
    mainAdminOnly: true,
    icon: HandCoins,
  },
  {
    to: '/reports',
    label: 'Reports',
    mainAdminOnly: true,
    icon: FileBarChart,
  },
  {
    to: '/units',
    label: 'Units',
    mainAdminOnly: true,
    icon: Building2,
  },
];

function LogoutButton({ onClick, collapsed }) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={collapsed ? 'Log out' : undefined}
      className={`flex items-center rounded-lg py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-red-500/10 dark:hover:text-red-400 ${
        collapsed ? 'w-full justify-center px-2' : 'gap-3 px-3'
      }`}
    >
      <LogOut size={18} />

      {!collapsed && <span>Log out</span>}
    </button>
  );
}

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}) {
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
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className='border-t border-zinc-100 pt-2 dark:border-zinc-800'>
          <LogoutButton onClick={logout} />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-r border-zinc-200 bg-white p-4 shadow-lg shadow-black transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 md:flex ${
          collapsed ? 'w-20' : 'w-60'
        }`}
      >
        {/* Desktop header */}
        <div
          className={`mb-6 flex items-center ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {collapsed ? (
            <button
              type='button'
              onClick={onToggleCollapse}
              className='rounded-lg p-1 transition-all hover:opacity-80 hover:scale-102'
              aria-label='Expand sidebar'
              title='Expand sidebar'
            >
              <img
                src={logo}
                alt='Dominion City'
                className='h-10 w-10 object-contain'
              />
            </button>
          ) : (
            <>
              <div className='px-2'>
                <BrandLockup variant='light' />
              </div>

              <button
                type='button'
                onClick={onToggleCollapse}
                className='rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white'
                aria-label='Minimize sidebar'
                title='Minimize sidebar'
              >
                <PanelLeftClose size={20} />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className='flex flex-1 flex-col gap-1'>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `${linkBase} ${collapsed ? 'justify-center px-2' : ''} ${
                    isActive ? linkActive : linkInactive
                  }`
                }
              >
                <Icon size={18} />

                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className='border-t border-zinc-100 pt-2 dark:border-zinc-800'>
          <LogoutButton onClick={logout} collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
