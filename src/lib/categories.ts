// Full class strings (no template-built names) so Tailwind's content scanner
// — and the safelist in tailwind.config.js — keep them in the bundle.
export interface CategoryStyle {
  label: string;
  pill: string;
}

const STYLES: Record<string, CategoryStyle> = {
  advertising: {
    label: 'Advertising',
    pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  },
  'brand & marketing': {
    label: 'Brand & Marketing',
    pill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  },
  'media & platforms': {
    label: 'Media & Platforms',
    pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  },
  culture: {
    label: 'Culture',
    pill: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200',
  },
  'fashion & beauty': {
    label: 'Fashion & Beauty',
    pill: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  },
  tech: {
    label: 'Tech',
    pill: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  },
  'opinion & essay': {
    label: 'Opinion & Essay',
    pill: 'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-200',
  },
  other: {
    label: 'Other',
    pill: 'bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-200',
  },
};

const OTHER = STYLES.other;

export function getCategoryStyle(category: string | null | undefined): CategoryStyle {
  if (!category) return OTHER;
  const key = category.trim().toLowerCase();
  return STYLES[key] ?? { ...OTHER, label: category };
}
