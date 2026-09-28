import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', handleAppInstalled);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );

      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstalled(true);
    }

    setInstallPrompt(null);
  }

  if (installed || !installPrompt) {
    return null;
  }

  return (
    <button
      type='button'
      onClick={handleInstall}
      aria-label='Install app'
      title='Install app'
      className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand text-brand hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-900/30'
    >
      <Download className='size-4 lg:size-5' />
    </button>
  );
}
