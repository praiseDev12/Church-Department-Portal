import { logo } from '../../assets/index.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import BrandLockup from './BrandLockup.jsx';

export default function AppLoader() {
  const { theme } = useTheme();

  return (
    <div
      className='fixed inset-0 z-9999 flex items-center justify-center bg-white dark:bg-gray-950'
      role='status'
      aria-label='Loading application'
    >
      <div className='relative flex items-center justify-center'>
        {/* Expanding pulse ring */}
        <span
          className='absolute size-28 rounded-full border-2 border-brand/20 animate-heart-ring dark:border-brand-300/20'
          aria-hidden='true'
        />

        {/* Secondary pulse ring */}
        <span
          className='absolute size-28 rounded-full border border-brand/10 animate-heart-ring-delayed dark:border-brand-300/10'
          aria-hidden='true'
        />

        {/* Church logo */}
        <div className='relative animate-heart-beat'>
          {/* <BrandLockup variant={theme} /> */}
          <img src={logo} alt='Dominion City Logo' className='size-10' />
        </div>
      </div>
    </div>
  );
}
