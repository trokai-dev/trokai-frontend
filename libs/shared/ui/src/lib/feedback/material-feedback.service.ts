import { Injectable, inject } from '@angular/core';
import { FeedbackService } from '@trokai/shared-core';
import { LoadingService } from '../loading/loading.service';
import { AlertService } from '../alert/alert.service';

/**
 * Material/web-canonical impl of the shared-core `FeedbackService` port.
 * Delegates to the existing shared-ui `LoadingService` + `AlertService`.
 * Each app binds it: `{ provide: FeedbackService, useClass: MaterialFeedbackService }`.
 */
@Injectable()
export class MaterialFeedbackService extends FeedbackService {
  private loading = inject(LoadingService);
  private alert = inject(AlertService);

  startLoading(message?: string): void {
    this.loading.start(message);
  }

  stopLoading(): void {
    this.loading.finish();
  }

  toast(message: string): void {
    this.alert.alert(message);
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
