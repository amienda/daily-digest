import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Article, ArticleStatus } from '../lib/types';

interface KeyboardTriageCallbacks {
  onUpdateStatus: (id: string, status: ArticleStatus) => Promise<void>;
  onInstapaperSave: (article: Article) => Promise<void>;
  onToggleHeart: (id: string, hearted: boolean) => Promise<void>;
  setFocusedIndex: Dispatch<SetStateAction<number | null>>;
  setShortcutsVisible: Dispatch<SetStateAction<boolean>>;
}

export interface KeyboardTriageOptions {
  articles: Article[];
  focusedIndex: number | null;
  shortcutsVisible: boolean;
  isOwner: boolean;
  enabled: boolean;
  callbacks: KeyboardTriageCallbacks;
}

export function useKeyboardTriage(options: KeyboardTriageOptions): void {
  // Use a ref so the handler always sees fresh values without re-registering.
  const ref = useRef(options);
  ref.current = options;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const { articles, focusedIndex, shortcutsVisible, isOwner, enabled, callbacks } =
        ref.current;

      if (!enabled) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return;

      const count = articles.length;

      switch (e.key) {
        case 'j':
        case 'J':
        case 'ArrowDown':
          if (!count) break;
          e.preventDefault();
          callbacks.setFocusedIndex(i => (i === null ? 0 : Math.min(i + 1, count - 1)));
          break;

        case 'k':
        case 'K':
        case 'ArrowUp':
          if (!count) break;
          e.preventDefault();
          callbacks.setFocusedIndex(i => (i === null ? 0 : Math.max(i - 1, 0)));
          break;

        case '?':
          e.preventDefault();
          callbacks.setShortcutsVisible(v => !v);
          break;

        case 'Escape':
          if (shortcutsVisible) {
            callbacks.setShortcutsVisible(false);
          } else if (focusedIndex !== null) {
            callbacks.setFocusedIndex(null);
          }
          break;

        case 'i':
        case 'I': {
          if (!isOwner || focusedIndex === null) break;
          const a = articles[focusedIndex];
          if (a?.status === 'new') {
            e.preventDefault();
            void callbacks.onInstapaperSave(a);
          }
          break;
        }

        case 'r':
        case 'R': {
          if (!isOwner || focusedIndex === null) break;
          const a = articles[focusedIndex];
          if (!a) break;
          e.preventDefault();
          void callbacks.onUpdateStatus(a.id, a.status === 'new' ? 'reading_list' : 'new');
          break;
        }

        case 'a':
        case 'A': {
          if (!isOwner || focusedIndex === null) break;
          const a = articles[focusedIndex];
          if (a?.status === 'new' || a?.status === 'reading_list') {
            e.preventDefault();
            void callbacks.onUpdateStatus(a.id, 'archived');
          }
          break;
        }

        case 'n':
        case 'N': {
          if (!isOwner || focusedIndex === null) break;
          const a = articles[focusedIndex];
          if (a?.status === 'new' || a?.status === 'reading_list') {
            e.preventDefault();
            void callbacks.onUpdateStatus(a.id, 'not_interested');
          }
          break;
        }

        case 'h':
        case 'H': {
          if (!isOwner || focusedIndex === null) break;
          const a = articles[focusedIndex];
          if (!a) break;
          e.preventDefault();
          void callbacks.onToggleHeart(a.id, !a.hearted);
          break;
        }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);
}
