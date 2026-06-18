import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { StorageService } from '@trokai/shared-core';

/** Mobile storage — Capacitor Preferences. */
@Injectable()
export class MobileStorageService extends StorageService {
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  }
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
