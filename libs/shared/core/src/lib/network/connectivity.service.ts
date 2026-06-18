import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Platform-agnostic connectivity stream. Each app provides one impl:
 * web = `online`/`offline` window events (BrowserRef), app = Capacitor Network (NetworkService).
 * Components/services subscribe to `connected$` instead of touching `window`/`@capacitor/network`.
 */
@Injectable()
export abstract class ConnectivityService {
  /** Emits `true` when online, `false` when offline. */
  abstract readonly connected$: Observable<boolean>;
}
