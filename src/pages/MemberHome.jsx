import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import PhotoUpload from '../components/members/PhotoUpload.jsx';

export default function MemberHome() {
  const { user, login, token } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');

  function handlePhotoUploaded(updatedMember) {
    setPhotoUrl(updatedMember.photoUrl);
    // Keep the session's cached user in sync so the new photo shows
    // immediately anywhere else it's referenced (e.g. after a refresh).
    login({ token, user: { ...user, photoUrl: updatedMember.photoUrl } });
  }

  return (
    <div className='mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center'>
      <PhotoUpload
        memberId={user?.id}
        currentPhotoUrl={photoUrl}
        name={user?.fullName}
        onUploaded={handlePhotoUploaded}
      />

      <h1 className='font-display text-2xl font-semibold text-zinc-900 dark:text-white'>
        Welcome, {user?.fullName}
      </h1>
    </div>
  );
}
