import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { Article } from '../lib/types';

interface ArchiveOldButtonProps {
  // Pool to consider — Today + Reading List articles, independent of any active
  // tab/category filters, since this is a maintenance sweep, not a view action.
  articles: Article[];
  onArchive: (ids: string[]) => Promise<void>;
}

function cutoffIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function ArchiveOldButton({ articles, onArchive }: ArchiveOldButtonProps) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState('14');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDays = Number(days);
  const validDays = Number.isFinite(parsedDays) && parsedDays > 0;

  const matches = useMemo(() => {
    if (!validDays) return [];
    const cutoff = cutoffIso(parsedDays);
    return articles.filter((a) => a.created_at < cutoff);
  }, [articles, parsedDays, validDays]);

  function close() {
    setOpen(false);
    setStep('input');
    setSubmitting(false);
  }

  // Close on click outside — same pattern as OwnerGate's popover.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function handlePreview(e: FormEvent) {
    e.preventDefault();
    if (!validDays) return;
    setStep('confirm');
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onArchive(matches.map((a) => a.id));
      close();
    } catch {
      // Error toast is surfaced by the caller; just stop the spinner here.
      setSubmitting(false);
    }
  }

  const fieldClass =
    'rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100';
  const ghostBtnClass =
    'rounded-lg px-3 py-1.5 text-sm text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800';
  const primaryBtnClass =
    'rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200';

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-xs font-medium text-stone-400 underline-offset-2 transition hover:text-stone-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded dark:text-stone-500 dark:hover:text-stone-300"
      >
        Archive old posts…
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-20 w-72 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          {step === 'input' ? (
            <form onSubmit={handlePreview}>
              <label
                htmlFor="archive-days"
                className="block text-xs font-medium text-stone-500 dark:text-stone-400"
              >
                Archive posts older than
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="archive-days"
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className={`w-16 ${fieldClass}`}
                />
                <span className="text-sm text-stone-600 dark:text-stone-400">days</span>
              </div>
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                Applies to Today and Reading List.
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={close} className={ghostBtnClass}>
                  Cancel
                </button>
                <button type="submit" disabled={!validDays} className={primaryBtnClass}>
                  Preview
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-sm text-stone-700 dark:text-stone-300">
                {matches.length === 0
                  ? 'No articles match — nothing to archive.'
                  : `${matches.length} article${matches.length === 1 ? '' : 's'} will be archived.`}
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setStep('input')} className={ghostBtnClass}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={matches.length === 0 || submitting}
                  className={primaryBtnClass}
                >
                  {submitting ? 'Archiving…' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
