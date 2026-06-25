import { Injectable, NgZone, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedbackService } from '@trokai/shared-core';
import { LoadingService } from '../loading/loading.service';
import { AlertService } from '../alert/alert.service';

/**
 * Material/web-canonical impl of the shared-core `FeedbackService` port.
 * Toasts are opened directly against `MatSnackBar` (top-positioned,
 * success/error panel classes — see `_toast-styles.scss`); dialogs/loading
 * still delegate to the existing shared-ui `AlertService`/`LoadingService`.
 * Each app binds it: `{ provide: FeedbackService, useClass: MaterialFeedbackService }`.
 */
@Injectable()
export class MaterialFeedbackService extends FeedbackService {
  private loading = inject(LoadingService);
  private alert = inject(AlertService);
  private snack = inject(MatSnackBar);
  private ngZone = inject(NgZone);

  startLoading(message?: string): void {
    this.loading.start(message);
  }

  stopLoading(): void {
    this.loading.finish();
  }

  success(message: string): void {
    this.showToast(message, 'tk-toast-success');
  }

  error(message: string): void {
    this.showToast(message, 'tk-toast-error');
  }

  warning(message: string): void {
    this.showToast(message, 'tk-toast-warning');
  }

  private showToast(message: string, panelClass: string): void {
    this.ngZone.runOutsideAngular(() => {
      const ref = this.snack.open(message, '', {
        duration: 0,
        verticalPosition: 'top',
        panelClass: ['tk-toast', panelClass],
      });
      // Zone.js-unpatched setTimeout so the dismiss timer never keeps
      // ApplicationRef unstable.
      const nativeSetTimeout: typeof setTimeout =
        (window as any).__zone_symbol__setTimeout ?? setTimeout;
      nativeSetTimeout(() => ref.dismiss(), 3000);
    });
  }

  info(title?: string, text?: string): Promise<boolean> {
    return this.alert.showDialog(title, text);
  }

  confirm(
    message: string,
    title?: string,
    okText?: string,
    noText?: string,
    danger = false,
  ): Promise<boolean> {
    return this.alert.question(message, title, okText, noText, danger);
  }
}
