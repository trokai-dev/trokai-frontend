import { Injectable } from '@angular/core';

/**
 * Platform-agnostic key/value storage. Each app provides one impl:
 * web = SSR-safe `localStorage` (via BrowserRef), app = Capacitor `Preferences`.
 *
 * Everything is async so the same contract covers Capacitor (async-only) and the
 * browser alike — components/services never touch `localStorage`/`Preferences`.
 */
@Injectable()
export abstract class StorageService {
  abstract get(key: string): Promise<string | null>;
  abstract set(key: string, value: string): Promise<void>;
  abstract remove(key: string): Promise<void>;
  abstract clear(): Promise<void>;

  /** Parsed JSON read; returns `null` on missing key or parse failure. */
  async getObject<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** JSON-stringify write. */
  async setObject(key: string, value: unknown): Promise<void> {
    await this.set(key, JSON.stringify(value));
  }

  /** Truthy-flag convenience. */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) != null;
  }
}
