import { Injectable, NgZone, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { DialogAlertComponent } from '../dialog-alert/dialog-alert.component';

/**
 * Modal dialog service (question/info/confirm). For transient toasts use
 * `FeedbackService.success()` / `.error()` (shared-core port, implemented
 * by `MaterialFeedbackService`) instead.
 */
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private dialog = inject(MatDialog);
  private overlay = inject(Overlay);
  private ngZone = inject(NgZone);

  // --- web question/info dialogs ---

  public async question(
    msg: string,
    title?: string,
    btnOkText?: string,
    btnNoText?: string,
    danger = false,
  ): Promise<boolean> {
    return this.openDialog({
      text: msg,
      title,
      btnOkText,
      btnNoText,
      danger,
      dialogQuestion: true,
    });
  }

  public async showDialog(title?: string, text?: string): Promise<boolean> {
    return this.openDialog(
      { title, text, btnText: 'OK' },
      this.overlay.scrollStrategies.noop(),
    );
  }

  // --- app-compat (Ionic modals redone as Material) ---

  public showAlert(header?: string, msg?: string): void {
    this.openDialog({ title: header, text: msg, btnText: 'Entendi' });
  }

  public showPromisedAlert(
    header?: string,
    msg?: string,
    okText = 'Entendi',
  ): Promise<boolean> {
    return this.openDialog({ title: header, text: msg, btnText: okText });
  }

  public askQuestion(
    header?: string,
    msg?: string,
    okText?: string,
    noText?: string,
    hideDanger = false,
  ): Promise<boolean> {
    return this.openDialog({
      title: header,
      text: msg,
      btnOkText: okText,
      btnNoText: noText,
      danger: !hideDanger,
      dialogQuestion: true,
    });
  }

  public showSuccess(
    title?: string,
    message?: string,
    okText = 'OK',
  ): Promise<boolean> {
    return this.openDialog({ title, text: message, btnText: okText });
  }

  private openDialog(data: any, scrollStrategy?: any): Promise<boolean> {
    return new Promise((resolve) => {
      this.ngZone.runOutsideAngular(() => {
        const dialogRef = this.dialog.open(DialogAlertComponent, {
          data,
          ...(scrollStrategy ? { scrollStrategy } : {}),
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.ngZone.run(() => resolve(result?.response));
        });
      });
    });
  }
}
