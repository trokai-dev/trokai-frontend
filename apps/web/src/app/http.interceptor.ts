import {
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { BaseAuthInterceptor } from '@trokai/shared-core';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from '@trokai/shared-ui';
import { REQUEST } from './express.tokens';
import { Request } from 'express';

interface CacheEntry {
  response: HttpResponse<any>;
  expiry: number;
}

// In-memory cache store (outside the class, so it's a true singleton across interceptor instances)
const requestCache = new Map<string, CacheEntry>();
const DEFAULT_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

@Injectable({ providedIn: 'root' })
export class CustomHttpInterceptor extends BaseAuthInterceptor {
  protected override readonly authScheme = 'Bearer ';

  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private request = inject<Request>(REQUEST, { optional: true });

  protected token(): string | undefined {
    return this.authService.getUserValue()?.token;
  }

  protected override shortCircuit(
    request: HttpRequest<unknown>,
  ): Observable<HttpEvent<unknown>> | null {
    // Session torn out from under the in-memory user → force logout.
    const user = this.authService.getUserValue();
    if (user?.token && !this.authService.checkStorageSession()?.token) {
      this.authService.logout();
      return of(null as unknown as HttpEvent<unknown>);
    }

    // Serve a fresh cached GET response.
    if (
      isPlatformBrowser(this.platformId) &&
      request.method === 'GET' &&
      request.headers.get('CacheEnabled')
    ) {
      const cached = requestCache.get(request.urlWithParams);
      if (cached) {
        if (Date.now() < cached.expiry) return of(cached.response.clone());
        requestCache.delete(request.urlWithParams);
      }
    }
    return null;
  }

  protected override prepare(
    request: HttpRequest<unknown>,
  ): HttpRequest<unknown> {
    if (this.isExternalApi(request.url)) return request;

    let headers = request.headers;

    // Forward real client IP during SSR so the API sees it.
    if (isPlatformServer(this.platformId) && this.request) {
      const forwardedFor = this.request.headers['x-forwarded-for'];
      const clientIp =
        typeof forwardedFor === 'string'
          ? forwardedFor.split(',')[0].trim()
          : this.request.socket?.remoteAddress;
      if (clientIp) headers = headers.append('X-Forwarded-For', clientIp);
    }

    // Ask the backend for resolved image URLs (images[].sm/md/lg).
    return request.clone({
      headers,
      params: request.params.set('resolveImages', 'true'),
    });
  }

  protected override onResponse(
    event: HttpEvent<unknown>,
    request: HttpRequest<unknown>,
  ): void {
    if (
      event instanceof HttpResponse &&
      isPlatformBrowser(this.platformId) &&
      request.method === 'GET' &&
      request.headers.get('CacheEnabled')
    ) {
      requestCache.set(request.urlWithParams, {
        response: event.clone(),
        expiry: Date.now() + DEFAULT_CACHE_DURATION_MS,
      });
    }
  }

  protected onErrorCode(code: string, _error: HttpErrorResponse): void {
    if (code === 'banned') {
      this.alertService.alert('Conta banida');
      this.authService.logout();
    } else if (code === 'token_expired') {
      this.authService.logout();
    } else if (code === 'apple_deleted') {
      this.authService.logout();
      this.alertService.alert('Conta excluída');
    } else if (code === 'apple_token') {
      this.authService.logout();
      this.alertService.alert('Sessão expirada');
    }
  }

  protected showError(message: string | null): void {
    if (message && message.toString().length > 0) {
      this.alertService.alert(message);
    } else {
      this.alertService.errorDefault();
    }
  }
}
