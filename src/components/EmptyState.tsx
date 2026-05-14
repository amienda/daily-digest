interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white/40 px-6 py-16 text-center dark:border-stone-800 dark:bg-stone-900/40">
      <p className="font-serif text-xl text-stone-700 dark:text-stone-200">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">{description}</p>
      )}
    </div>
  );
}
