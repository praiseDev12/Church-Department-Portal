import { logo } from '../../assets/index.js';

export default function BrandLockup({ variant = 'dark' }) {
  const nameClass =
    variant === 'dark'
      ? 'text-brand-400 text-lg font-bold'
      : 'text-brand-500 dark:text-brand-400 text-lg font-bold';
  const subtitleClass =
    variant === 'dark'
      ? 'relative font-display text-sm font-semibold text-white -mt-1.5'
      : 'relative font-display text-sm font-semibold -mt-1.5';

  const locationClass =
    variant === 'dark'
      ? 'text-[7px] text-brand-50 text-left'
      : 'text-[7px] text-brand-500 dark:text-brand-50 text-left';

  return (
    <div className='flex items-center gap-3'>
      <img src={logo} alt='dc logo' className='size-10' />
      <div className='flex flex-col'>
        <p className={nameClass}>Dominion City</p>
        <p className={subtitleClass}>Department Portal</p>
        <p className={locationClass}>Asaba HQ</p>
      </div>
    </div>
  );
}
