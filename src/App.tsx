import { useCallback, useMemo, useState } from 'react';
import { ArticleCard } from './components/ArticleCard';
import { DarkModeToggle } from './components/DarkModeToggle';
import { EmptyState } from './components/EmptyState';
import { Tabs } from './components/Tabs';
import { ToastViewport, type ToastMessage, type ToastVariant } from './components/Toast';
import { useArticles } from './hooks/useArticles';
import type { Article, TabKey } from './lib/types';

const EMPTY_STATES: Record<TabKey, { title: string; description?: string }> = {
  today: {
    title: 'No new articles',
    description: 'Check back at 2PM — the next digest drops then.',
  },
  reading_list: {
    title: 'Reading list is empty',
    description: 'Hit "Reading List" on a card to save it here for later.',
  },
  archive: {
    title: 'Nothing archived yet',
    description: 'Articles you skip or send to Instapaper land here.',
  },
};

export default function App() {
  const { articles, loading, error, updateStatus } = useArticles();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    setToasts((curr) => [...curr, { id: Date.now() + Math.random(), message, variant }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const grouped = useMemo(() => {
    const today: Article[] = [];
    const reading: Article[] = [];
    const archive: Article[] = [];
    for (const a of articles) {
      if (a.status === 'new') today.push(a);
      else if (a.status === 'reading_list') reading.push(a);
      else archive.push(a); // archived OR saved_to_instapaper
    }
    return { today, reading, archive };
  }, [articles]);

  const counts: Record<TabKey, number> = {
    today: grouped.today.length,
    reading_list: grouped.reading.length,
    archive: grouped.archive.length,
  };

  const visible =
    activeTab === 'today'
      ? grouped.today
      : activeTab === 'reading_list'
        ? grouped.reading
        : grouped.archive;

  const handleUpdateStatus = useCallback(
    async (id: string, status: Article['status']) => {
      try {
        await updateStatus(id, status);
        if (status === 'new') pushToast('Moved back to Today', 'success');
        else if (status === 'reading_list') pushToast('Saved to reading list', 'success');
        else if (status === 'archived') pushToast('Archived', 'info');
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Update failed', 'error');
        throw e;
      }
    },
    [updateStatus, pushToast],
  );

  const handleInstapaperSave = useCallback(
    async (article: Article) => {
      try {
        const res = await fetch('/api/instapaper-save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: article.url }),
        });

        // Try to parse JSON regardless of status for richer error messages.
        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          error?: string;
        };

        if (!res.ok || !data.success) {
          throw new Error(data.error || `Instapaper save failed (HTTP ${res.status})`);
        }

        await updateStatus(article.id, 'saved_to_instapaper');
        pushToast('Saved to Instapaper', 'success');
      } catch (e) {
        pushToast(
          e instanceof Error ? e.message : 'Could not save to Instapaper',
          'error',
        );
        throw e;
      }
    },
    [updateStatus, pushToast],
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:mx-0 lg:max-w-none lg:px-10">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
              Daily Digest
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {activeTab === 'today'
                ? loading
                  ? 'Loading…'
                  : `${counts.today} article${counts.today === 1 ? '' : 's'} today`
                : activeTab === 'reading_list'
                  ? `${counts.reading_list} saved for later`
                  : `${counts.archive} in the archive`}
            </p>
          </div>
          <DarkModeToggle />
        </header>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs active={activeTab} counts={counts} onChange={setActiveTab} />
        </div>

        {/* Content */}
        {error ? (
          <EmptyState
            title="Couldn't load articles"
            description={error}
          />
        ) : loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={EMPTY_STATES[activeTab].title}
            description={EMPTY_STATES[activeTab].description}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visible.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onUpdateStatus={handleUpdateStatus}
                onInstapaperSave={handleInstapaperSave}
              />
            ))}
          </div>
        )}
      </div>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
