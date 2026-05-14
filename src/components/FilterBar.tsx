interface FilterBarProps {
  categories: string[];
  publications: string[];
  activeCategory: string | null;
  activePublication: string | null;
  filterHearted: boolean;
  searchQuery: string;
  onCategoryChange: (cat: string | null) => void;
  onPublicationChange: (pub: string | null) => void;
  onHeartedChange: (val: boolean) => void;
  onSearchChange: (q: string) => void;
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
  filterHearted,
  searchQuery,
  onCategoryChange,
  onPublicationChange,
  onHeartedChange,
  onSearchChange,
}: FilterBarProps) {
  const anyActive = activeCategory !== null || activePublication !== null || filterHearted || searchQuery !== '';

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <FilterIcon />

      {/* Search input */}
      <div className="relative inline-flex items-center">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 text-stone-400 dark:text-stone-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          aria-label="Search articles"
          className={[
            'h-7 w-32 rounded-full border pl-7 pr-2.5 text-xs font-medium leading-none transition',
            'focus:w-48 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-0 dark:focus:ring-stone-500',
            '[transition:width_150ms_ease,border-color_150ms,background-color_150ms]',
            searchQuery
              ? 'border-stone-400 bg-stone-100 text-stone-900 dark:border-stone-500 dark:bg-stone-800 dark:text-stone-100'
              : 'border-stone-200 bg-white text-stone-500 placeholder:text-stone-400 hover:border-stone-300 hover:text-stone-700 dark:border-stone-700 dark:bg-transparent dark:text-stone-400 dark:placeholder:text-stone-600 dark:hover:border-stone-500',
          ].join(' ')}
        />
      </div>

      {/* Favorites toggle chip */}
      <button
        type="button"
        onClick={() => onHeartedChange(!filterHearted)}
        aria-pressed={filterHearted}
        className={[
          'inline-flex h-7 items-center gap-1.5 rounded-full border pl-2 pr-2.5 text-xs font-medium transition',
          'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0',
          filterHearted
            ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400'
            : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700 dark:border-stone-700 dark:bg-transparent dark:text-stone-400 dark:hover:border-stone-500',
        ].join(' ')}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          fill={filterHearted ? 'currentColor' : 'none'}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Favorites
      </button>

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
            onHeartedChange(false);
            onSearchChange('');
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
