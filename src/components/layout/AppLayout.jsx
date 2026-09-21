import { useState } from 'react';

import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';

import Topbar from './Topbar.jsx';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const nextValue = !current;

      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));

      return nextValue;
    });
  };

  return (
    <div className='flex min-h-dvh min-w-0 bg-white dark:bg-zinc-900 dark:text-white'>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className='flex min-w-0 flex-1 flex-col'>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className='min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 md:p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
