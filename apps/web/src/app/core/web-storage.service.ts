import { Injectable, inject } from '@angular/core';
import { StorageService } from '@trokai/shared-core';
import { BrowserRef } from '../services/browser-ref.service';

/** Web storage — SSR-safe `localStorage` via BrowserRef (no-op on the server). */
@Injectable()
export class WebStorageService extends StorageService {
  private browserRef = inject(BrowserRef);

  async get(key: string): Promise<string | null> {
    return this.browserRef.localStorage?.getItem(key) ?? null;
  }
  async set(key: string, value: string): Promise<void> {
    this.browserRef.localStorage?.setItem(key, value);
  }
  async remove(key: string): Promise<void> {
    this.browserRef.localStorage?.removeItem(key);
  }
  async clear(): Promise<void> {
    this.browserRef.localStorage?.clear();
  }
}
