import { Injectable, inject } from '@angular/core';
import { SearchHistoryEntry, StorageService } from '@trokai/shared-core';

const STORAGE_KEY = 'search-history';
const MAX_ENTRIES = 10;

/**
 * Recent-searches list, persisted via the platform-agnostic StorageService
 * (web: localStorage, app: Capacitor Preferences). Entries are deduplicated by
 * (query, categoryId, vendors) and kept most-recent-first.
 */
@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  private storage = inject(StorageService);

  async getAll(): Promise<SearchHistoryEntry[]> {
    return (await this.storage.getObject<SearchHistoryEntry[]>(STORAGE_KEY)) ?? [];
  }

  async add(entry: Omit<SearchHistoryEntry, 'at'>): Promise<SearchHistoryEntry[]> {
    const list = await this.getAll();

    const deduped = list.filter(
      (e) =>
        !(
          e.query === entry.query &&
          (e.categoryId ?? null) === (entry.categoryId ?? null) &&
          !!e.vendors === !!entry.vendors
        ),
    );

    const next = [{ ...entry, at: Date.now() }, ...deduped].slice(0, MAX_ENTRIES);
    await this.storage.setObject(STORAGE_KEY, next);
    return next;
  }

  async clear(): Promise<void> {
    await this.storage.remove(STORAGE_KEY);
  }
}
