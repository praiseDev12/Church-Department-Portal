import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Download,
  Palette,
  Check,
  Cake,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { Player } from '@remotion/player';
import { renderMediaOnWeb } from '@remotion/web-renderer';
import BirthdayVideo from '../remotion/BirthdayVideo';
import { birthdayVideoConfig } from '../remotion/birthdayVideoConfig';
import { apiFetch } from '../lib/api';

const templates = [
  {
    id: 'gold',
    name: 'Golden Celebration',
    background:
      'radial-gradient(circle at 15% 15%, #fbbf24 0%, transparent 45%), radial-gradient(circle at 85% 85%, #a16207 0%, transparent 50%), linear-gradient(135deg, #111827 0%, #292524 50%, #78350f 100%)',
    accent: '#fbbf24',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    background:
      'radial-gradient(circle at 15% 15%, #c084fc 0%, transparent 45%), radial-gradient(circle at 85% 85%, #6d28d9 0%, transparent 50%), linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7e22ce 100%)',
    accent: '#c084fc',
  },
  {
    id: 'blue',
    name: 'Blue Celebration',
    background:
      'radial-gradient(circle at 15% 15%, #38bdf8 0%, transparent 45%), radial-gradient(circle at 85% 85%, #1e40af 0%, transparent 50%), linear-gradient(135deg, #020617 0%, #0c1e3e 50%, #1e3a8a 100%)',
    accent: '#38bdf8',
  },
];

export default function BirthdayCard() {
  const navigate = useNavigate();

  const [birthdays, setBirthdays] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [message, setMessage] = useState(
    'Wishing you a wonderful birthday filled with joy, blessings and beautiful moments.',
  );
  const [previewMode, setPreviewMode] = useState('image'); // 'image' | 'video'
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [videoDownloading, setVideoDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBirthdays = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await apiFetch('/birthdays');

        setBirthdays(data.birthdays || []);
      } catch (err) {
        console.error('Failed to load birthdays:', err);
        setError(err.message || 'Failed to load birthdays.');
      } finally {
        setLoading(false);
      }
    };

    loadBirthdays();
  }, []);

  const handleCreateCard = (member) => {
    setSelectedMember(member);
    setPreviewMode('image');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleCloseEditor = () => {
    setSelectedMember(null);
  };

  const handleDownloadImage = async () => {
    if (!selectedMember || downloading) return;

    try {
      setDownloading(true);

      const card = document.getElementById('birthday-card-preview');

      if (!card) {
        throw new Error('Birthday card preview not found.');
      }

      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const image = canvas.toDataURL('image/png');

      const link = document.createElement('a');

      link.download = `${selectedMember.fullName
        .replace(/\s+/g, '-')
        .toLowerCase()}-birthday-card.png`;

      link.href = image;
      link.click();
    } catch (error) {
      console.error('Birthday card download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!selectedMember || videoDownloading) return;

    try {
      setVideoDownloading(true);

      const inputProps = {
        member: selectedMember,
        template: selectedTemplate,
        message,
        logoSrc: '/portal-logo.png',
      };

      const result = await renderMediaOnWeb({
        composition: {
          id: 'BirthdayVideo',
          width: birthdayVideoConfig.width,
          height: birthdayVideoConfig.height,
          fps: birthdayVideoConfig.fps,
          durationInFrames: birthdayVideoConfig.durationInFrames,
          component: BirthdayVideo,
          defaultProps: inputProps,
        },
        serveUrl: window.location.origin,
        codec: 'h264',
        inputProps,
        onProgress: (progress) => {
          console.log(
            `Birthday video rendering: ${Math.round(progress * 100)}%`,
          );
        },
      });

      const blob = await result.getBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;
      link.download = `${selectedMember.fullName
        .replace(/\s+/g, '-')
        .toLowerCase()}-birthday-video.mp4`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Birthday video download error:', error);
    } finally {
      setVideoDownloading(false);
    }
  };

  // Single entry point for the left panel's Download button — dispatches
  // to whichever format is currently being previewed.
  const handleDownload = () => {
    if (previewMode === 'video') {
      handleDownloadVideo();
    } else {
      handleDownloadImage();
    }
  };

  const isBusy = downloading || videoDownloading;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div>
          <h1 className='text-2xl font-semibold text-white'>Birthday Cards</h1>

          <p className='mt-1 text-sm text-gray-500'>
            Create a birthday card for a member.
          </p>
        </div>
      </div>

      {/* Card editor */}
      {selectedMember && (
        <div className='grid gap-6 lg:grid-cols-[320px_1fr]'>
          {/* Controls */}
          <div className='rounded-xl border border-gray-200 bg-gray-200 p-5'>
            <div className='mb-5'>
              <h2 className='font-semibold text-gray-900'>Card Settings</h2>

              <p className='mt-1 text-sm text-gray-500'>
                Customize the birthday card.
              </p>
            </div>

            {/* Member */}
            <div className='mb-6 flex items-center gap-3'>
              {selectedMember.photoUrl ? (
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.fullName}
                  className='h-12 w-12 rounded-full object-cover'
                />
              ) : (
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600'>
                  {selectedMember.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div>
                <p className='font-medium text-gray-900'>
                  {selectedMember.fullName}
                </p>

                <p className='text-sm text-gray-500'>Birthday member</p>
              </div>
            </div>

            {/* Templates */}
            <div className='mb-6'>
              <label className='mb-3 flex items-center gap-2 text-sm font-medium text-gray-700'>
                <Palette size={16} />
                Template
              </label>

              <div className='space-y-3'>
                {templates.map((template) => {
                  const isSelected = selectedTemplate.id === template.id;

                  return (
                    <button
                      key={template.id}
                      type='button'
                      onClick={() => setSelectedTemplate(template)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Template preview */}
                      <div
                        className='h-12 w-16 shrink-0 rounded-lg shadow-inner'
                        style={{
                          background: template.background,
                        }}
                      />

                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {template.name}
                        </p>

                        <p className='mt-0.5 text-xs text-gray-500'>
                          Birthday design
                        </p>
                      </div>

                      {isSelected && (
                        <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white'>
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div className='mb-6'>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Birthday Message
              </label>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className='w-full resize-none rounded-lg border text-black border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400'
                placeholder='Write a birthday message...'
              />
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={handleCloseEditor}
                className='flex-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>

              <button
                type='button'
                onClick={handleDownload}
                disabled={isBusy}
                className='flex flex-1 text-[10px] items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60'
              >
                <Download size={16} />

                {previewMode === 'video'
                  ? videoDownloading
                    ? 'Generating Video...'
                    : 'Download Video'
                  : downloading
                    ? 'Generating...'
                    : 'Download Image'}
              </button>
            </div>
          </div>

          {/* Preview — single area, toggled between Photo and Video */}
          <div className='rounded-xl border border-gray-200 bg-gray-300 p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h2 className='font-semibold text-gray-900'>Preview</h2>

                <p className='mt-1 text-sm text-gray-500'>
                  {previewMode === 'video'
                    ? 'This is how the animated video will look.'
                    : 'This is how the birthday card will look.'}
                </p>
              </div>

              {/* Photo / Video toggle */}
              <div className='flex shrink-0 rounded-lg border border-gray-300 bg-white p-1'>
                <button
                  type='button'
                  onClick={() => setPreviewMode('image')}
                  disabled={downloading || videoDownloading}
                  className={`flex items-center gap-1.5 disabled:cursor-not-allowed rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    previewMode === 'image'
                      ? 'bg-brand text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ImageIcon size={14} />
                  Photo
                </button>
                <button
                  type='button'
                  onClick={() => setPreviewMode('video')}
                  disabled={downloading || videoDownloading}
                  className={`flex items-center gap-1.5 disabled:cursor-not-allowed rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    previewMode === 'video'
                      ? 'bg-brand text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Video size={14} />
                  Video
                </button>
              </div>
            </div>

            <div className='flex min-h-150 items-center justify-center'>
              {previewMode === 'image' ? (
                <div
                  id='birthday-card-preview'
                  className='relative flex w-full max-w-115 flex-col overflow-hidden rounded-[28px] p-8 text-center text-white shadow-2xl'
                  style={{
                    background: selectedTemplate.background,
                    color: '#ffffff',
                  }}
                >
                  {/* Soft dark vignette for text contrast */}
                  <div
                    className='absolute inset-0'
                    style={{
                      background:
                        'radial-gradient(circle at 50% 40%, transparent 30%, rgba(0,0,0,0.35) 100%)',
                    }}
                  />

                  {/* Floating accent rings */}
                  <div
                    className='absolute -right-10 -top-10 h-36 w-36 rounded-full border'
                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                  />
                  <div
                    className='absolute -bottom-14 -left-14 h-44 w-44 rounded-full'
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  />

                  {/* Content */}
                  <div className='relative z-10 flex flex-col items-center'>
                    <div
                      className='mb-6 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em]'
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#ffffff',
                        textAlign: 'center',
                        paddingBottom: '1rem',
                      }}
                    >
                      🎉 Happy Birthday
                    </div>

                    {/* Member Photo */}
                    <div
                      className='mb-5 flex h-32 w-32 items-center justify-center rounded-full'
                      style={{ backgroundColor: selectedTemplate.accent }}
                    >
                      <div
                        className='flex h-30 w-30 items-center justify-center rounded-full'
                        style={{ backgroundColor: '#0b0b12' }}
                      >
                        {selectedMember.photoUrl ? (
                          <img
                            src={selectedMember.photoUrl}
                            alt={selectedMember.fullName}
                            crossOrigin='anonymous'
                            style={{
                              height: '112px',
                              width: '112px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            className='flex h-28 w-28 items-center justify-center rounded-full text-4xl font-bold'
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.15)',
                              color: '#ffffff',
                            }}
                          >
                            {selectedMember.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <h3
                      className='max-w-full wrap-break-word text-3xl font-bold tracking-tight'
                      style={{
                        color: '#ffffff',
                        textAlign: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      {selectedMember.fullName}
                    </h3>

                    <div
                      className='mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium'
                      style={{
                        backgroundColor: `${selectedTemplate.accent}22`,
                        color: selectedTemplate.accent,
                        border: `1px solid ${selectedTemplate.accent}55`,
                        textAlign: 'center',
                        paddingBottom: '1rem',
                      }}
                    >
                      <Cake
                        size={13}
                        style={{
                          marginTop: '0.25rem',
                        }}
                      />
                      {new Date(selectedMember.dateOfBirth).toLocaleDateString(
                        'en-NG',
                        {
                          day: 'numeric',
                          month: 'long',
                        },
                      )}
                    </div>

                    <div
                      className='mx-auto mt-8 max-w-sm rounded-2xl px-5 py-4'
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        textAlign: 'center',
                      }}
                    >
                      <p
                        className='text-[15px] leading-7 italic'
                        style={{
                          color: 'rgba(255,255,255,0.92)',
                          paddingBottom: '1rem',
                          textAlign: 'center',
                        }}
                      >
                        "{message}"
                      </p>
                    </div>

                    {/* Divider */}
                    <div className='mt-8 flex items-center gap-3'>
                      <div
                        className='h-px w-10'
                        style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                      />
                      <Cake
                        size={16}
                        style={{ color: selectedTemplate.accent }}
                      />
                      <div
                        className='h-px w-10'
                        style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                      />
                    </div>

                    <div className='mt-6 flex flex-col items-center'>
                      <img
                        src='/portal-logo.png'
                        alt='DC Department Portal'
                        crossOrigin='anonymous'
                        className='mb-2 h-5 w-auto max-w-32 object-contain opacity-90'
                      />
                      <p
                        className='text-[10px] font-semibold tracking-[0.2em] uppercase'
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                      >
                        DC Department Portal
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='flex w-full justify-center overflow-hidden rounded-[28px] bg-black p-3'>
                  <Player
                    component={BirthdayVideo}
                    durationInFrames={birthdayVideoConfig.durationInFrames}
                    compositionWidth={birthdayVideoConfig.width}
                    compositionHeight={birthdayVideoConfig.height}
                    fps={birthdayVideoConfig.fps}
                    inputProps={{
                      member: selectedMember,
                      template: selectedTemplate,
                      message,
                      logoSrc: '/portal-logo.png',
                    }}
                    controls
                    loop
                    style={{
                      width: '100%',
                      maxWidth: '420px',
                      aspectRatio: '4 / 5',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Birthday list */}
      {!selectedMember && (
        <>
          {loading && (
            <div className='rounded-xl border border-gray-200 bg-white p-8 text-center'>
              <p className='text-sm text-gray-500'>Loading birthdays...</p>
            </div>
          )}

          {!loading && error && (
            <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600'>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='border-b border-gray-200 p-5'>
                <div className='flex items-center gap-2'>
                  <Cake size={20} className='text-gray-700' />

                  <h2 className='font-semibold text-gray-900'>
                    This Month&apos;s Birthdays
                  </h2>
                </div>
              </div>

              {birthdays.length === 0 ? (
                <div className='p-8 text-center'>
                  <p className='text-sm text-gray-500'>
                    There are no birthdays this month.
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-gray-100'>
                  {birthdays.map((member) => {
                    const birthday = new Date(member.dateOfBirth);

                    return (
                      <div
                        key={member._id}
                        className='flex items-center justify-between gap-4 p-5'
                      >
                        <div className='flex items-center gap-3'>
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.fullName}
                              className='h-12 w-12 rounded-full object-cover'
                            />
                          ) : (
                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600'>
                              {member.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className='font-medium text-gray-900'>
                              {member.fullName}
                            </p>

                            <p className='text-sm text-gray-500'>
                              {birthday.toLocaleDateString('en-NG', {
                                day: 'numeric',
                                month: 'long',
                              })}

                              {member.unit?.name
                                ? ` • ${member.unit.name}`
                                : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type='button'
                          onClick={() => handleCreateCard(member)}
                          className='rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800'
                        >
                          Create Card
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
