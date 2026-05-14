import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArticleCard } from './components/ArticleCard';
import { DarkModeToggle } from './components/DarkModeToggle';
import { EmptyState } from './components/EmptyState';
import { FilterBar } from './components/FilterBar';
import { OwnerGate } from './components/OwnerGate';
import { Tabs } from './components/Tabs';
import { ToastViewport, type ToastMessage, type ToastVariant } from './components/Toast';
import { useArticles } from './hooks/useArticles';
import { useKeyboardTriage } from './hooks/useKeyboardTriage';
import { useOwnerMode } from './hooks/useOwnerMode';
import type { Article, ArticleStatus, TabKey } from './lib/types';

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '…' : s;
}

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

const SHORTCUTS = [
  { keys: 'J / ↓', label: 'Next article' },
  { keys: 'K / ↑', label: 'Previous article' },
  { keys: 'I', label: 'Save to Instapaper' },
  { keys: 'R', label: 'Reading list' },
  { keys: 'N', label: 'Not interested' },
  { keys: 'H', label: 'Heart / unheart' },
  { keys: '?', label: 'Show / hide shortcuts' },
  { keys: 'Esc', label: 'Clear selection' },
] as const;

export default function App() {
  const { articles, loading, error, updateStatus, toggleHeart } = useArticles();
  const { isOwner, unlock, lock } = useOwnerMode();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPublication, setFilterPublication] = useState<string | null>(null);
  const [filterHearted, setFilterHearted] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const [shortcutsVisible, setShortcutsVisible] = useState(false);

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    setFilterCategory(null);
    setFilterPublication(null);
    setFocusedCardIndex(null);
  }

  const pushToast = useCallback(
    (
      message: string,
      variant: ToastVariant = 'info',
      title?: string,
      undoAction?: () => Promise<void>,
    ) => {
      setToasts((curr) => [
        ...curr,
        { id: Date.now() + Math.random(), message, variant, title, undoAction },
      ]);
    },
    [],
  );

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

  const availableCategories = useMemo(
    () => [...new Set(visible.map((a) => a.category).filter(Boolean))].sort(),
    [visible],
  );
  const availablePublications = useMemo(
    () => [...new Set(visible.map((a) => a.publication).filter(Boolean))].sort(),
    [visible],
  );

  const filtered = useMemo(
    () =>
      visible.filter((a) => {
        if (filterHearted && !a.hearted) return false;
        if (filterCategory && a.category?.toLowerCase() !== filterCategory.toLowerCase())
          return false;
        if (filterPublication && a.publication !== filterPublication) return false;
        return true;
      }),
    [visible, filterHearted, filterCategory, filterPublication],
  );

  // Clamp focus when articles leave the list (triage action or filter change).
  useEffect(() => {
    if (focusedCardIndex !== null && focusedCardIndex >= filtered.length) {
      setFocusedCardIndex(filtered.length > 0 ? filtered.length - 1 : null);
    }
  }, [filtered.length, focusedCardIndex]);

  // Log raw load errors for debugging without surfacing them in the UI.
  useEffect(() => {
    if (error) console.error('Articles load error:', error);
  }, [error]);

  const handleUpdateStatus = useCallback(
    async (id: string, status: ArticleStatus) => {
      const article = articles.find((a) => a.id === id);
      const prevStatus = article?.status;
      const shortTitle = article ? truncate(article.headline, 40) : '';
      try {
        await updateStatus(id, status);

        const undoAction: (() => Promise<void>) | undefined =
          prevStatus != null
            ? async () => {
                try {
                  await updateStatus(id, prevStatus);
                } catch {
                  pushToast('Undo failed — try refreshing', 'error');
                }
              }
            : undefined;

        const message =
          status === 'new'
            ? 'Moved to Today'
            : status === 'reading_list'
              ? 'Saved to reading list'
              : 'Archived';
        pushToast(message, status === 'archived' ? 'info' : 'success', shortTitle, undoAction);
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Update failed', 'error');
        throw e;
      }
    },
    [articles, updateStatus, pushToast],
  );

  const handleInstapaperSave = useCallback(
    async (article: Article) => {
      const shortTitle = truncate(article.headline, 40);
      try {
        const res = await fetch('/api/instapaper-save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-App-Secret': import.meta.env.VITE_APP_SECRET ?? '',
          },
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

        const undoAction = async () => {
          try {
            await updateStatus(article.id, 'new');
          } catch {
            pushToast('Undo failed — try refreshing', 'error');
          }
        };
        pushToast('Saved to Instapaper', 'success', shortTitle, undoAction);
      } catch (e) {
        console.error('Instapaper save error:', e);
        pushToast("Couldn't save to Instapaper. Check your connection and try again.", 'error');
        throw e;
      }
    },
    [updateStatus, pushToast],
  );

  const handleToggleHeart = useCallback(
    async (id: string, hearted: boolean) => {
      const article = articles.find((a) => a.id === id);
      const shortTitle = article ? truncate(article.headline, 40) : '';
      try {
        await toggleHeart(id, hearted);
        const undoAction = async () => {
          try {
            await toggleHeart(id, !hearted);
          } catch {
            pushToast('Undo failed — try refreshing', 'error');
          }
        };
        pushToast(hearted ? 'Hearted' : 'Unhearted', 'success', shortTitle, undoAction);
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Update failed', 'error');
        throw e;
      }
    },
    [articles, toggleHeart, pushToast],
  );

  useKeyboardTriage({
    articles: filtered,
    focusedIndex: focusedCardIndex,
    shortcutsVisible,
    isOwner,
    enabled: !loading && !error,
    callbacks: {
      onUpdateStatus: handleUpdateStatus,
      onInstapaperSave: handleInstapaperSave,
      onToggleHeart: handleToggleHeart,
      setFocusedIndex: setFocusedCardIndex,
      setShortcutsVisible,
    },
  });

  const shortcutsBtnClass = [
    'hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border text-stone-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
    shortcutsVisible
      ? 'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300'
      : 'border-stone-200 bg-white hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800',
  ].join(' ');

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShortcutsVisible((v) => !v)}
              aria-label="Keyboard shortcuts"
              aria-pressed={shortcutsVisible}
              title="Keyboard shortcuts (?)"
              className={shortcutsBtnClass}
            >
              <span className="text-sm font-medium leading-none" aria-hidden="true">?</span>
            </button>
            <OwnerGate isOwner={isOwner} onUnlock={unlock} onLock={lock} />
            <DarkModeToggle />
          </div>
        </header>

        {/* Keyboard shortcuts panel — desktop only, inline */}
        {shortcutsVisible && (
          <div className="hidden sm:block mb-6 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium tracking-tight text-stone-500 dark:text-stone-400">
                Keyboard shortcuts
              </p>
              <button
                type="button"
                onClick={() => setShortcutsVisible(false)}
                aria-label="Close shortcuts"
                className="rounded text-stone-400 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:hover:text-stone-200"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {SHORTCUTS.map(({ keys, label }) => (
                <div key={keys} className="flex items-center gap-2.5">
                  <kbd className="inline-flex min-w-[2.75rem] items-center justify-center rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    {keys}
                  </kbd>
                  <span className="text-sm text-stone-600 dark:text-stone-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <Tabs active={activeTab} counts={counts} onChange={handleTabChange} />
        </div>

        {/* Filters — only shown when there are articles in this tab */}
        {!loading && !error && visible.length > 0 && (
          <div className="mb-5">
            <FilterBar
              categories={availableCategories}
              publications={availablePublications}
              activeCategory={filterCategory}
              activePublication={filterPublication}
              filterHearted={filterHearted}
              onCategoryChange={setFilterCategory}
              onPublicationChange={setFilterPublication}
              onHeartedChange={setFilterHearted}
            />
          </div>
        )}

        {/* Content */}
        {error ? (
          <EmptyState
            title="Couldn't load articles"
            description="Check your connection and try refreshing."
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
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No articles match these filters"
            description="Try a different category or publication, or clear the filters."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((article, idx) => (
              <ArticleCard
                key={article.id}
                article={article}
                isOwner={isOwner}
                isFocused={idx === focusedCardIndex}
                onUpdateStatus={handleUpdateStatus}
                onInstapaperSave={handleInstapaperSave}
                onToggleHeart={handleToggleHeart}
              />
            ))}
          </div>
        )}
      </div>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
