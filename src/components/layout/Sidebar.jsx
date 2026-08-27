import { NavLink } from 'react-router-dom';
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
  { to: '/contributions', label: 'Contributions' },
  { to: '/reports', label: 'Reports' },
  { to: '/units', label: 'Units', mainAdminOnly: true },
  { to: '/audit-log', label: 'Audit Log', mainAdminOnly: true },
];

export default function Sidebar() {
  const { isMainAdmin } = useAuth();

  return (
    <aside className='hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:flex'>
      <div className='mb-6 px-2'>
        <BrandLockup variant='light' />
      </div>
      <nav className='flex flex-1 flex-col gap-1'>
        {navItems
          .filter((item) => !item.mainAdminOnly || isMainAdmin)
          .map((item) => (
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
  );
}
