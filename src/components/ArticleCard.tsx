import { useEffect, useRef, useState } from 'react';
import type { Article, ArticleStatus } from '../lib/types';
import { getCategoryStyle } from '../lib/categories';

interface ArticleCardProps {
  article: Article;
  isOwner: boolean;
  isFocused?: boolean;
  onUpdateStatus: (id: string, status: ArticleStatus) => Promise<void>;
  onInstapaperSave: (article: Article) => Promise<void>;
  onToggleHeart: (id: string, hearted: boolean) => Promise<void>;
}

type PendingAction = 'instapaper' | 'new' | 'reading_list' | 'archived' | 'not_interested' | null;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

export function ArticleCard({ article, isOwner, isFocused = false, onUpdateStatus, onInstapaperSave, onToggleHeart }: ArticleCardProps) {
  const [pending, setPending] = useState<PendingAction>(null);
  const articleRef = useRef<HTMLElement>(null);
  const cat = getCategoryStyle(article.category);
  const disabled = pending !== null;

  useEffect(() => {
    if (isFocused) {
      articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isFocused]);

  async function handle(action: Exclude<PendingAction, null>) {
    if (disabled) return;
    setPending(action);
    try {
      if (action === 'instapaper') {
        await onInstapaperSave(article);
      } else {
        await onUpdateStatus(article.id, action);
      }
    } catch {
      // Errors surface as toasts from App; just reset local pending state.
    } finally {
      setPending(null);
    }
  }

  const isToday = article.status === 'new';
  const isReadingList = article.status === 'reading_list';
  const isArchive = article.status === 'archived' || article.status === 'saved_to_instapaper' || article.status === 'not_interested';

  return (
    <article
      ref={articleRef}
      className={[
        'group rounded-2xl border p-5 transition sm:p-6',
        isFocused
          ? 'border-stone-400 bg-white hover:bg-stone-50 dark:border-stone-500 dark:bg-stone-900 dark:hover:bg-stone-800'
          : 'border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight ${cat.pill}`}
          >
            {cat.label}
          </span>
          {article.status === 'saved_to_instapaper' && (
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              Instapaper
            </span>
          )}
          {article.status === 'not_interested' && (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-400 dark:bg-red-950/30 dark:text-red-500">
              Not interested
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Heart: clickable for owner, read-only indicator for visitors */}
          {(isOwner || article.hearted) && (
            <button
              type="button"
              onClick={isOwner ? () => onToggleHeart(article.id, !article.hearted) : undefined}
              disabled={!isOwner}
              aria-label={article.hearted ? 'Remove heart' : 'Heart this article'}
              className={[
                'transition',
                isOwner
                  ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-sm'
                  : 'cursor-default',
                article.hearted
                  ? 'text-red-500'
                  : 'text-stone-300 hover:text-red-400 dark:text-stone-600 dark:hover:text-red-500',
              ].join(' ')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                fill={article.hearted ? 'currentColor' : 'none'}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
          <time
            dateTime={article.created_at}
            className="text-xs text-stone-400 dark:text-stone-500"
          >
            {formatDate(article.created_at)}
          </time>
        </div>
      </div>

      <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-balance text-stone-900 dark:text-stone-50 sm:text-[1.65rem]">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {article.headline}
        </a>
      </h2>

      <p className="mt-1 text-sm italic text-stone-500 dark:text-stone-400">
        {article.publication}
      </p>

      <p className="mt-3 max-w-prose text-[0.95rem] leading-relaxed text-stone-700 dark:text-stone-300">
        {article.summary}
      </p>

      {isOwner && <div className="mt-5 flex flex-wrap gap-2">
        {isToday && (
          <>
            <ActionButton
              variant="primary"
              loading={pending === 'instapaper'}
              disabled={disabled}
              onClick={() => handle('instapaper')}
            >
              Save to Instapaper
            </ActionButton>
            <ActionButton
              variant="secondary"
              loading={pending === 'reading_list'}
              disabled={disabled}
              onClick={() => handle('reading_list')}
            >
              Reading List
            </ActionButton>
            <ActionButton
              variant="secondary"
              loading={pending === 'archived'}
              disabled={disabled}
              onClick={() => handle('archived')}
            >
              Done
            </ActionButton>
            <ActionButton
              variant="destructive"
              loading={pending === 'not_interested'}
              disabled={disabled}
              onClick={() => handle('not_interested')}
            >
              Not Interested
            </ActionButton>
          </>
        )}

        {isReadingList && (
          <>
            <ActionButton
              variant="secondary"
              loading={pending === 'new'}
              disabled={disabled}
              onClick={() => handle('new')}
            >
              Move to Today
            </ActionButton>
            <ActionButton
              variant="secondary"
              loading={pending === 'archived'}
              disabled={disabled}
              onClick={() => handle('archived')}
            >
              Done
            </ActionButton>
            <ActionButton
              variant="destructive"
              loading={pending === 'not_interested'}
              disabled={disabled}
              onClick={() => handle('not_interested')}
            >
              Not Interested
            </ActionButton>
          </>
        )}

        {isArchive && (
          <ActionButton
            variant="secondary"
            loading={pending === 'new'}
            disabled={disabled}
            onClick={() => handle('new')}
          >
            Move to Today
          </ActionButton>
        )}
      </div>}
    </article>
  );
}

interface ActionButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive';
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ActionButtonProps['variant'], string> = {
  primary:
    'bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200',
  secondary:
    'border border-stone-200 bg-white text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800',
  ghost:
    'text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200',
  destructive:
    'text-red-400/80 hover:bg-red-50 hover:text-red-600 dark:text-red-500/60 dark:hover:bg-red-950/30 dark:hover:text-red-400',
};

function ActionButton({ variant, loading, disabled, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'tap-target inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:focus-visible:ring-stone-500',
        VARIANT_CLASSES[variant],
      ].join(' ')}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
