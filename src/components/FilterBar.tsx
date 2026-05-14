interface FilterBarProps {
  categories: string[];
  publications: string[];
  activeCategory: string | null;
  activePublication: string | null;
  onCategoryChange: (cat: string | null) => void;
  onPublicationChange: (pub: string | null) => void;
}

function Chevron() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none shrink-0"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-stone-400 dark:text-stone-500"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

interface ChipSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string | null) => void;
}

function ChipSelect({ label, value, options, onChange }: ChipSelectProps) {
  const isActive = value !== '';
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label={label}
        className={[
          // Fixed height keeps chips consistent across browsers/OS.
          'h-7 appearance-none cursor-pointer rounded-full border pl-2.5 pr-5',
          'text-xs font-medium leading-none transition',
          'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-0 dark:focus:ring-stone-500',
          isActive
            ? 'border-stone-400 bg-stone-100 text-stone-900 dark:border-stone-500 dark:bg-stone-800 dark:text-stone-100'
            : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700 dark:border-stone-700 dark:bg-transparent dark:text-stone-400 dark:hover:border-stone-500',
        ].join(' ')}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {/* Chevron sits inside the right padding zone */}
      <span className="pointer-events-none absolute right-1.5 text-stone-400 dark:text-stone-500">
        <Chevron />
      </span>
    </div>
  );
}

export function FilterBar({
  categories,
  publications,
  activeCategory,
  activePublication,
  onCategoryChange,
  onPublicationChange,
}: FilterBarProps) {
  const anyActive = activeCategory !== null || activePublication !== null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <FilterIcon />

      <ChipSelect
        label="Category"
        value={activeCategory ?? ''}
        options={categories}
        onChange={onCategoryChange}
      />

      <ChipSelect
        label="Publication"
        value={activePublication ?? ''}
        options={publications}
        onChange={onPublicationChange}
      />

      {anyActive && (
        <button
          type="button"
          onClick={() => {
            onCategoryChange(null);
            onPublicationChange(null);
          }}
          className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
