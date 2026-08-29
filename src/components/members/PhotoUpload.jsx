import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { apiUpload } from '../../lib/api.js';

export default function PhotoUpload({ memberId, currentPhotoUrl, name = '', onUploaded }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentPhotoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function handlePick() {
    inputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      const data = await apiUpload(`/members/${memberId}/photo`, formData);
      onUploaded(data.member);
    } catch (err) {
      setError(err.message || 'Could not upload photo.');
    } finally {
      setUploading(false);
    }
  }

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white dark:ring-zinc-900"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
            {initials}
          </div>
        )}
        <button
          type="button"
          onClick={handlePick}
          aria-label="Change photo"
          className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm hover:bg-brand-600"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="text-sm">
        {uploading ? (
          <p className="text-zinc-500 dark:text-zinc-400">Uploading…</p>
        ) : (
          <button
            type="button"
            onClick={handlePick}
            className="font-medium text-brand-500 hover:underline dark:text-brand-300"
          >
            {currentPhotoUrl ? 'Change photo' : 'Add photo'}
          </button>
        )}
        {error && <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}
