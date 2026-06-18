import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const EXTERNAL_APIS = ['viacep', 'googleapis'];

/**
 * Platform-agnostic auth/error interceptor skeleton shared by web + app.
 * Subclasses inject their own AuthService/alert facilities and override the
 * template hooks; the common pipeline (auth header, known error-code dispatch,
 * error surfacing) lives here once.
 */
export abstract class BaseAuthInterceptor implements HttpInterceptor {
  /** Current user token, or undefined when anonymous. */
  protected abstract token(): string | undefined;

  /** Authorization header prefix (web: `Bearer `, app: ``). */
  protected readonly authScheme: string = '';

  /** Platform reaction to a known backend error `code` (banned / token_expired / …). */
  protected abstract onErrorCode(code: string, error: HttpErrorResponse): void;

  /** Surface a backend error message to the user. */
  protected abstract showError(message: string | null): void;

  /** Cache/storage short-circuit (web). Return a stream to skip `next.handle`. */
  protected shortCircuit(
    request: HttpRequest<unknown>,
  ): Observable<HttpEvent<unknown>> | null {
    return null;
  }

  /** Per-request mutation hook (SSR headers, query params). */
  protected prepare(request: HttpRequest<unknown>): HttpRequest<unknown> {
    return request;
  }

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  protected onResponse(_event: HttpEvent<unknown>, _request: HttpRequest<unknown>): void {}

  protected isExternalApi(url: string): boolean {
    return EXTERNAL_APIS.some((api) => url.includes(api));
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const short = this.shortCircuit(request);
    if (short) return short;

    const token = this.token();
    if (token && !this.isExternalApi(request.url)) {
      request = request.clone({
        headers: request.headers.set(
          'Authorization',
          `${this.authScheme}${token}`,
        ),
      });
    }

    request = this.prepare(request);

    return next.handle(request).pipe(
      tap((event) => this.onResponse(event, request)),
      catchError((error: HttpErrorResponse) => {
        const code = error.error?.code;
        if (code) this.onErrorCode(code, error);
        this.showError(error.error?.message ?? null);
        return throwError(() => error.error);
      }),
    );
  }
}
