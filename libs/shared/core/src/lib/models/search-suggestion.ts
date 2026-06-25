export type SearchSuggestionKind = 'category' | 'vendors';

/** In-memory view-model built while typing — never persisted as-is. */
export interface SearchSuggestion {
  kind: SearchSuggestionKind;
  label: string;
  query: string;
  categoryId?: number;
  categoryLabel?: string;
}

export interface SearchSuggestionsViewModel {
  query: string;
  categories: SearchSuggestion[];
  vendors: SearchSuggestion;
}
