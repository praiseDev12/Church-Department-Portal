import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const labelClass =
  'mb-1.5 block text-xs lg:text-sm font-medium text-zinc-700 dark:text-zinc-300';

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500';

export default function FormInput({
  id,
  label,
  hint,
  helperText,
  className = '',
  type = 'text',
  ...inputProps
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}

        {hint && (
          <span className='ml-1 font-normal text-zinc-400 dark:text-zinc-500'>
            {hint}
          </span>
        )}
      </label>

      <div className='relative'>
        <input
          id={id}
          type={inputType}
          className={`${inputClass} ${isPassword ? 'pr-11' : ''} ${className}`}
          {...inputProps}
        />

        {isPassword && (
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {helperText && (
        <p className='mt-1.5 text-xs text-zinc-400 dark:text-zinc-500'>
          {helperText}
        </p>
      )}
    </div>
  );
}
