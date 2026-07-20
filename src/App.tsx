import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArchiveOldButton } from './components/ArchiveOldButton';
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

function DoneForToday({ readingList, archive }: { readingList: number; archive: number }) {
  const parts: string[] = [];
  if (readingList > 0) parts.push(`${readingList} saved for later`);
  if (archive > 0) parts.push(`${archive} archived`);
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white/40 px-6 py-16 text-center dark:border-stone-800 dark:bg-stone-900/40">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 dark:text-stone-600" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
      <p className="mt-4 font-serif text-xl text-stone-700 dark:text-stone-200">All done for today</p>
      {parts.length > 0 && (
        <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">{parts.join(', ')}</p>
      )}
      <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">Next digest drops at 2PM.</p>
    </div>
  );
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
    title: 'Nothing here yet',
    description: 'Articles you read or dismiss will collect here.',
  },
};

const SHORTCUTS = [
  { keys: 'J / ↓', label: 'Next article' },
  { keys: 'K / ↑', label: 'Previous article' },
  { keys: 'I', label: 'Save to Instapaper' },
  { keys: 'R', label: 'Reading list' },
  { keys: 'A', label: 'Archive (done)' },
  { keys: 'N', label: 'Not interested' },
  { keys: 'H', label: 'Heart / unheart' },
  { keys: '?', label: 'Show / hide shortcuts' },
  { keys: 'Esc', label: 'Clear selection' },
] as const;

export default function App() {
  const { articles, loading, error, updateStatus, toggleHeart, bulkUpdateStatuses } = useArticles();
  const { isOwner, unlock, lock } = useOwnerMode();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPublication, setFilterPublication] = useState<string | null>(null);
  const [filterHearted, setFilterHearted] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(
    () => localStorage.getItem('lastOpenedArticleId'),
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);
  const [shortcutsVisible, setShortcutsVisible] = useState(false);

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    setFilterCategory(null);
    setFilterPublication(null);
    setFilterSearch('');
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
      else archive.push(a); // archived, not_interested, or saved_to_instapaper
    }
    return { today, reading, archive };
  }, [articles]);

  const counts: Record<TabKey, number> = {
    today: grouped.today.length,
    reading_list: grouped.reading.length,
    archive: grouped.archive.length,
  };

  // Pool eligible for the "archive old posts" sweep — untouched Today items and
  // saved-but-unread Reading List items. Independent of the active tab/filters,
  // since this is a maintenance action rather than a view action.
  const archivable = useMemo(() => [...grouped.today, ...grouped.reading], [grouped]);

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
        if (filterSearch) {
          const q = filterSearch.toLowerCase();
          if (!a.headline.toLowerCase().includes(q) && !a.summary.toLowerCase().includes(q))
            return false;
        }
        return true;
      }),
    [visible, filterHearted, filterCategory, filterPublication, filterSearch],
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
              : status === 'not_interested'
                ? 'Marked not interested'
                : 'Archived';
        const variant = status === 'archived' || status === 'not_interested' ? 'info' : 'success';
        pushToast(message, variant, shortTitle, undoAction);
        if (id === lastOpenedId) {
          setLastOpenedId(null);
          localStorage.removeItem('lastOpenedArticleId');
        }
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Update failed', 'error');
        throw e;
      }
    },
    [articles, updateStatus, pushToast],
  );

  const handleBulkArchive = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      // Snapshot each article's current status so a batch can be undone as one unit,
      // restoring 'new' items to Today and 'reading_list' items to Reading List.
      const snapshot = ids
        .map((id) => articles.find((a) => a.id === id))
        .filter((a): a is Article => a != null)
        .map((a) => ({ id: a.id, status: a.status }));

      try {
        await bulkUpdateStatuses(ids.map((id) => ({ id, status: 'archived' as ArticleStatus })));

        const undoAction = async () => {
          try {
            await bulkUpdateStatuses(snapshot);
          } catch {
            pushToast('Undo failed — try refreshing', 'error');
          }
        };

        pushToast(
          `Archived ${ids.length} article${ids.length === 1 ? '' : 's'}`,
          'info',
          undefined,
          undoAction,
        );
      } catch (e) {
        pushToast(e instanceof Error ? e.message : 'Archive failed', 'error');
        throw e;
      }
    },
    [articles, bulkUpdateStatuses, pushToast],
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

  const handleLinkClick = useCallback((id: string) => {
    setLastOpenedId(id);
    localStorage.setItem('lastOpenedArticleId', id);
  }, []);

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
        <div className={isOwner && !loading && !error && archivable.length > 0 ? 'mb-1' : 'mb-6'}>
          <Tabs active={activeTab} counts={counts} onChange={handleTabChange} />
        </div>

        {/* Maintenance sweep — owner-only, tucked under the tabs rather than a bulk-action row */}
        {isOwner && !loading && !error && archivable.length > 0 && (
          <div className="mb-5 flex justify-end pt-2">
            <ArchiveOldButton articles={archivable} onArchive={handleBulkArchive} />
          </div>
        )}

        {/* Filters — only shown when there are articles in this tab */}
        {!loading && !error && visible.length > 0 && (
          <div className="mb-5">
            <FilterBar
              categories={availableCategories}
              publications={availablePublications}
              activeCategory={filterCategory}
              activePublication={filterPublication}
              filterHearted={filterHearted}
              searchQuery={filterSearch}
              onCategoryChange={setFilterCategory}
              onPublicationChange={setFilterPublication}
              onHeartedChange={setFilterHearted}
              onSearchChange={setFilterSearch}
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
        ) : visible.length === 0 && activeTab === 'today' && (counts.reading_list + counts.archive) > 0 ? (
          <DoneForToday readingList={counts.reading_list} archive={counts.archive} />
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
        ) : activeTab === 'archive' ? (
          (() => {
            const readArticles = filtered.filter(
              (a) => a.status === 'archived' || a.status === 'saved_to_instapaper',
            );
            const notInterestedArticles = filtered.filter((a) => a.status === 'not_interested');
            const anyFilterActive = !!(filterCategory || filterPublication || filterHearted || filterSearch);
            const NOT_INTERESTED_CAP = 24;
            const notInterestedVisible = anyFilterActive
              ? notInterestedArticles
              : notInterestedArticles.slice(0, NOT_INTERESTED_CAP);
            const notInterestedHidden = anyFilterActive
              ? 0
              : Math.max(0, notInterestedArticles.length - NOT_INTERESTED_CAP);
            return (
              <div className="space-y-10">
                {readArticles.length > 0 && (
                  <section>
                    <p className="mb-4 text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Read
                    </p>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {readArticles.map((article) => {
                        const idx = filtered.indexOf(article);
                        return (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            isOwner={isOwner}
                            isFocused={idx === focusedCardIndex}
                            isLastOpened={article.id === lastOpenedId}
                            onUpdateStatus={handleUpdateStatus}
                            onInstapaperSave={handleInstapaperSave}
                            onToggleHeart={handleToggleHeart}
                            onLinkClick={handleLinkClick}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}
                {notInterestedVisible.length > 0 && (
                  <section>
                    <p className="mb-4 text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                      Not Interested
                    </p>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {notInterestedVisible.map((article) => {
                        const idx = filtered.indexOf(article);
                        return (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            isOwner={isOwner}
                            isFocused={idx === focusedCardIndex}
                            isLastOpened={article.id === lastOpenedId}
                            onUpdateStatus={handleUpdateStatus}
                            onInstapaperSave={handleInstapaperSave}
                            onToggleHeart={handleToggleHeart}
                            onLinkClick={handleLinkClick}
                          />
                        );
                      })}
                    </div>
                    {notInterestedHidden > 0 && (
                      <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
                        Showing {NOT_INTERESTED_CAP} of {notInterestedArticles.length} — use filters to search further
                      </p>
                    )}
                  </section>
                )}
              </div>
            );
          })()
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((article, idx) => (
              <ArticleCard
                key={article.id}
                article={article}
                isOwner={isOwner}
                isFocused={idx === focusedCardIndex}
                isLastOpened={article.id === lastOpenedId}
                onUpdateStatus={handleUpdateStatus}
                onInstapaperSave={handleInstapaperSave}
                onToggleHeart={handleToggleHeart}
                onLinkClick={handleLinkClick}
              />
            ))}
          </div>
        )}
      </div>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
