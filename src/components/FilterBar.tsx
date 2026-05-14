import { getCategoryStyle } from '../lib/categories';

interface FilterBarProps {
  categories: string[];
  publications: string[];
  activeCategory: string | null;
  activePublication: string | null;
  onCategoryChange: (cat: string | null) => void;
  onPublicationChange: (pub: string | null) => void;
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

  function toggleCategory(cat: string) {
    onCategoryChange(activeCategory === cat ? null : cat);
  }

  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 dark:border-stone-800">
      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Category
        </span>

        {/* "All" chip */}
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
            activeCategory === null
              ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900'
              : 'border border-stone-200 text-stone-500 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800',
          ].join(' ')}
        >
          All
        </button>

        {categories.map((cat) => {
          const style = getCategoryStyle(cat);
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
                style.pill,
                isActive
                  ? 'ring-2 ring-stone-900 ring-offset-1 dark:ring-stone-100 dark:ring-offset-stone-950'
                  : 'opacity-70 hover:opacity-100',
              ].join(' ')}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      {/* Publication select + clear */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Publication
        </span>

        <select
          value={activePublication ?? ''}
          onChange={(e) => onPublicationChange(e.target.value || null)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 transition focus:outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:ring-stone-500"
        >
          <option value="">All publications</option>
          {publications.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {anyActive && (
          <button
            type="button"
            onClick={() => {
              onCategoryChange(null);
              onPublicationChange(null);
            }}
            className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
