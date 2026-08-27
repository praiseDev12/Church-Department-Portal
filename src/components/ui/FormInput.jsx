const labelClass =
  'mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300';
const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500';

export default function FormInput({
  id,
  label,
  hint,
  helperText,
  className = '',
  ...inputProps
}) {
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
      <input id={id} className={`${inputClass} ${className}`} {...inputProps} />
      {helperText && (
        <p className='mt-1.5 text-xs text-zinc-400 dark:text-zinc-500'>
          {helperText}
        </p>
      )}
    </div>
  );
}
