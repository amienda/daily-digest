interface FilterBarProps {
  categories: string[];
  publications: string[];
  activeCategory: string | null;
  activePublication: string | null;
  onCategoryChange: (cat: string | null) => void;
  onPublicationChange: (pub: string | null) => void;
}

// Chevron icon for the select chips.
function Chevron() {
  return (
    <svg
      width="10"
      height="10"
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

// Funnel / filter icon.
function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
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
          'appearance-none cursor-pointer rounded-full border py-1 pl-3 pr-6 text-xs font-medium transition',
          'focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500',
          isActive
            ? 'border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800',
        ].join(' ')}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span
        className={[
          'pointer-events-none absolute right-2',
          isActive ? 'text-stone-400 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500',
        ].join(' ')}
      >
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
    <div className="flex flex-wrap items-center gap-2 py-3">
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
          onClick={() => { onCategoryChange(null); onPublicationChange(null); }}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
