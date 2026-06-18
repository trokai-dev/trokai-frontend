import { Injectable, NgZone, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';
import { DialogAlertComponent } from '../dialog-alert/dialog-alert.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private overlay = inject(Overlay);
  private ngZone = inject(NgZone);

  // --- snackbar toasts ---

  public alert(msg: string) {
    // eslint-disable-next-line no-empty
    try { this.show(msg); } catch {}
  }

  public errorDefault() {
    this.show('Ops! Algo deu errado!');
  }

  public success(msg: string) {
    this.show(msg);
  }

  public error(msg: string) {
    this.show(msg);
  }

  public warning(msg: string) {
    this.show(msg);
  }

  public postSuccess() {
    this.show('Informações salvas!');
  }

  public formError() {
    this.show('Preencha os campos corretamente');
  }

  private show(msg: string) {
    this.ngZone.runOutsideAngular(() => {
      const ref = this.snack.open(msg, '', { duration: 0 });
      // Zone.js-unpatched setTimeout so the dismiss timer never keeps
      // ApplicationRef unstable.
      const nativeSetTimeout: typeof setTimeout =
        (window as any).__zone_symbol__setTimeout ?? setTimeout;
      nativeSetTimeout(() => ref.dismiss(), 3000);
    });
  }

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
