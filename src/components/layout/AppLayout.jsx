import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  return (
    <div className='flex min-h-dvh min-w-0 bg-white dark:bg-zinc-900 dark:text-white'>
      <Sidebar />

      <div className='flex min-w-0 flex-1 flex-col'>
        <Topbar />

        <main className='min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 md:p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
