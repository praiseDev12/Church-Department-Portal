const labelClass =
  'mb-1.5 block text-xs lg:text-sm font-medium text-zinc-700 dark:text-zinc-300';
const selectClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

/**
 * `options`: [{ value, label }]
 * `placeholder`: shown as a disabled first option, e.g. "Select a unit"
 */
export default function FormSelect({
  id,
  label,
  hint,
  helperText,
  options,
  placeholder,
  className = '',
  ...selectProps
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
      <select
        id={id}
        className={`${selectClass} ${className}`}
        {...selectProps}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className='mt-1.5 text-xs text-zinc-400 dark:text-zinc-500'>
          {helperText}
        </p>
      )}
    </div>
  );
}
