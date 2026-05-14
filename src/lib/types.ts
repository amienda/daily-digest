export type ArticleStatus =
  | 'new'
  | 'reading_list'
  | 'archived'
  | 'saved_to_instapaper';

export interface Article {
  id: string;
  headline: string;
  url: string;
  publication: string;
  category: string;
  summary: string;
  created_at: string;
  status: ArticleStatus;
  hearted: boolean;
}

export type TabKey = 'today' | 'reading_list' | 'archive';
