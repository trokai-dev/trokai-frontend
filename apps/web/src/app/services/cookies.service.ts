import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Request } from 'express';
import { REQUEST } from '../express.tokens';

@Injectable({
  providedIn: 'root',
})
export class CookiesService {
  private platformId = inject(PLATFORM_ID);
  private request = inject<Request>(REQUEST, { optional: true });

  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Get a cookie value by key.
   * Returns the parsed JSON object or null if not found.
   */
  get<T>(key: string): T | null {
    const cookieString = this.getCookieString();
    const match = cookieString.match(new RegExp('(^| )' + key + '=([^;]+)'));

    if (match) {
      try {
        return JSON.parse(decodeURIComponent(match[2])) as T;
      } catch (_e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Set a cookie value (Browser Only).
   * @param key The name of the cookie
   * @param value The data object to store
   * @param days Expiration in days (default: 365). Pass null for session cookie.
   */
  set(key: string, value: unknown, days = 365): void {
    if (!this.isBrowser) {
      return; // We typically don't set cookies from the server during rendering
    }

    const jsonValue = encodeURIComponent(JSON.stringify(value));
    let expires = '';

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }

    // path=/ ensures it's available on all routes
    // SameSite=Lax is good for standard navigation
    document.cookie = `${key}=${jsonValue}${expires}; path=/; SameSite=Lax`;
  }

  /**
   * Delete a cookie by setting its expiry to the past.
   */
  delete(key: string): void {
    if (this.isBrowser) {
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }

  /**
   * Checks if a cookie exists.
   */
  has(key: string): boolean {
    return !!this.get(key);
  }

  private getCookieString(): string {
    if (this.isBrowser) {
      return document.cookie || '';
    } else {
      // Server-side: read from Express request
      return this.request?.headers?.cookie || '';
    }
  }
}
