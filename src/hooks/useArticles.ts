import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Article, ArticleStatus } from '../lib/types';

interface StatusUpdate {
  id: string;
  status: ArticleStatus;
}

interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStatus: (id: string, status: ArticleStatus) => Promise<void>;
  toggleHeart: (id: string, hearted: boolean) => Promise<void>;
  bulkUpdateStatuses: (updates: StatusUpdate[]) => Promise<void>;
}

export function useArticles(): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setArticles([]);
    } else {
      setArticles((data ?? []) as Article[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateStatus = useCallback(
    async (id: string, status: ArticleStatus) => {
      // Optimistic update — flip local state first, roll back on failure.
      const prev = articles;
      setArticles((curr) => curr.map((a) => (a.id === id ? { ...a, status } : a)));

      const { error: err } = await supabase
        .from('articles')
        .update({ status })
        .eq('id', id);

      if (err) {
        setArticles(prev);
        throw new Error(err.message);
      }
    },
    [articles],
  );

  const toggleHeart = useCallback(
    async (id: string, hearted: boolean) => {
      const prev = articles;
      setArticles((curr) => curr.map((a) => (a.id === id ? { ...a, hearted } : a)));
      const { error: err } = await supabase
        .from('articles')
        .update({ hearted })
        .eq('id', id);
      if (err) {
        setArticles(prev);
        throw new Error(err.message);
      }
    },
    [articles],
  );

  // Batch-update several articles at once (e.g. "archive everything older than N days").
  // Groups by target status so it's one Supabase query per distinct status rather than
  // one per article, then rolls back the optimistic update on failure.
  const bulkUpdateStatuses = useCallback(
    async (updates: StatusUpdate[]) => {
      if (updates.length === 0) return;
      const prev = articles;
      const byId = new Map(updates.map((u) => [u.id, u.status]));
      setArticles((curr) => curr.map((a) => (byId.has(a.id) ? { ...a, status: byId.get(a.id)! } : a)));

      const byStatus = new Map<ArticleStatus, string[]>();
      for (const u of updates) {
        const ids = byStatus.get(u.status) ?? [];
        ids.push(u.id);
        byStatus.set(u.status, ids);
      }

      const results = await Promise.all(
        Array.from(byStatus.entries()).map(([status, ids]) =>
          supabase.from('articles').update({ status }).in('id', ids),
        ),
      );

      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setArticles(prev);
        throw new Error(failed.error.message);
      }
    },
    [articles],
  );

  return { articles, loading, error, refetch: fetchAll, updateStatus, toggleHeart, bulkUpdateStatuses };
}
