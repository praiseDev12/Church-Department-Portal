import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Button from '../components/ui/Button.jsx';
import PhotoUpload from '../components/members/PhotoUpload.jsx';

export default function MemberHome() {
  const { user, login, token, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');

  function handlePhotoUploaded(updatedMember) {
    setPhotoUrl(updatedMember.photoUrl);
    // Keep the session's cached user in sync so the new photo shows
    // immediately anywhere else it's referenced (e.g. after a refresh).
    login({ token, user: { ...user, photoUrl: updatedMember.photoUrl } });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <p className="font-display text-lg font-semibold text-brand-500 dark:text-brand-300">
          Department Portal
        </p>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/"
              className="text-sm font-medium text-brand-500 hover:underline dark:text-brand-300"
            >
              Go to admin dashboard
            </Link>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-lg p-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <PhotoUpload
          memberId={user?.id}
          currentPhotoUrl={photoUrl}
          name={user?.fullName}
          onUploaded={handlePhotoUploaded}
        />

        <div>
          <h1 className="font-display text-2xl font-semibold text-zinc-900 dark:text-white">
            Welcome, {user?.fullName}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Service check-in will appear here once it's turned on for your
            department.
          </p>
        </div>
      </main>
    </div>
  );
}
