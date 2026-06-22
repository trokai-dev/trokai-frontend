import { isPlatformBrowser } from '@angular/common';
import { Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

function _window(): Window {
  return window;
}

function _localStorage(): Storage {
  return localStorage;
}

function _sessionStorage(): Storage {
  return sessionStorage;
}

@Injectable()
export class BrowserRef {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  private _connected = new BehaviorSubject<boolean>(true);

  constructor() {
    this.loadNet();
  }

  get window(): Window | null {
    if (isPlatformBrowser(this.platformId)) return _window();
    return null;
  }

  get localStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) return _localStorage();
    return null;
  }

  get sessionStorage(): Storage | null {
    if (isPlatformBrowser(this.platformId)) return _sessionStorage();
    return null;
  }

  get connected$() {
    return this._connected.asObservable();
  }

  private loadNet() {
    if (!this.window) return;
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('online', () =>
        this.ngZone.run(() => this._connected.next(true)),
      );
      window.addEventListener('offline', () =>
        this.ngZone.run(() => this._connected.next(false)),
      );
    });
  }

  public loadMainScripts() {
    if (!this.window) return;
    this.loadPixel();
    this.loadClarity();
  }

  public loadSecondaryScripts() {
    // this.loadJivo();
  }

  private async loadClarity() {
    if (!environment.production) return;
    const Clarity = (await import('@microsoft/clarity')).default;
    Clarity.init(environment.clarity);
  }

  private loadJivo() {
    if (!environment.production) return;
    if (
      !this.window ||
      (window as unknown as Record<string, unknown>).jivoLoaded
    )
      return;
    const script = document.createElement('script');
    script.src = '//code.jivosite.com/widget/VvxfqN68OV';
    script.async = true;
    document.head.appendChild(script);
    (window as unknown as Record<string, unknown>).jivoLoaded = true;
  }

  private loadPixel() {
    if (
      !this.window ||
      (window as unknown as Record<string, unknown>).fbqLoaded
    )
      return;
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.async = true;
    document.head.appendChild(script);
    (window as unknown as Record<string, unknown>).fbqLoaded = true;
  }

  public loadAppleSignIn() {
    if (
      !this.window ||
      (window as unknown as Record<string, unknown>).appleSignInLoaded
    )
      return;
    const script = document.createElement('script');
    script.src =
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    document.head.appendChild(script);
    (window as unknown as Record<string, unknown>).appleSignInLoaded = true;
  }
}
