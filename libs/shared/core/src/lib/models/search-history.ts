/** Minimal, JSON-serializable recent-search entry. No category = plain Enter search. */
export interface SearchHistoryEntry {
  query: string;
  categoryId?: number | null;
  categoryLabel?: string | null;
  vendors?: boolean;
  at: number;
}
