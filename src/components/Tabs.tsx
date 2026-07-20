import type { TabKey } from '../lib/types';

interface TabsProps {
  active: TabKey;
  counts: Record<TabKey, number>;
  onChange: (tab: TabKey) => void;
}

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'reading_list', label: 'Reading List' },
  { key: 'archive', label: 'Archive' },
];

export function Tabs({ active, counts, onChange }: TabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Article queue"
      className="no-scrollbar flex gap-1 overflow-x-auto border-b border-stone-200 dark:border-stone-800"
    >
      {TABS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={[
              'tap-target relative px-4 py-3 text-sm font-medium tracking-tight transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:focus-visible:ring-stone-500',
              isActive
                ? 'text-stone-900 dark:text-stone-50'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200',
            ].join(' ')}
          >
            <span>{label}</span>
            <span
              className={[
                'ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs',
                isActive
                  ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900'
                  : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
              ].join(' ')}
            >
              {counts[key]}
            </span>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-stone-900 dark:bg-stone-50"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
