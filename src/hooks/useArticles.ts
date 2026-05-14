import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Article, ArticleStatus } from '../lib/types';

interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStatus: (id: string, status: ArticleStatus) => Promise<void>;
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

  return { articles, loading, error, refetch: fetchAll, updateStatus };
}
