import { type FormEvent, useEffect, useRef, useState } from 'react';

interface OwnerGateProps {
  isOwner: boolean;
  onUnlock: (pin: string) => boolean;
  onLock: () => void;
}

export function OwnerGate({ isOwner, onUnlock, onLock }: OwnerGateProps) {
  const [showForm, setShowForm] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when form appears.
  useEffect(() => {
    if (showForm) inputRef.current?.focus();
  }, [showForm]);

  // Close on click outside.
  useEffect(() => {
    if (!showForm) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowForm(false);
        setPin('');
        setError(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showForm]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (onUnlock(pin)) {
      setShowForm(false);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  }

  const btnClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400';

  if (isOwner) {
    return (
      <button
        type="button"
        onClick={onLock}
        aria-label="Lock — exit owner mode"
        title="Exit owner mode"
        className={btnClass}
      >
        {/* Unlocked padlock */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setShowForm((v) => !v)}
        aria-label="Owner login"
        title="Owner login"
        className={btnClass}
      >
        {/* Locked padlock */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-700 dark:bg-stone-900"
        >
          <p className="mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">Owner PIN</p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="••••"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-stone-50 transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              Unlock
            </button>
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-red-500">Incorrect PIN</p>
          )}
        </form>
      )}
    </div>
  );
}
