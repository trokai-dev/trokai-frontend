import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogLoadingComponent } from '../dialog-loading/dialog-loading.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private dialog = inject(MatDialog);
  private ref?: MatDialogRef<DialogLoadingComponent>;

  public start(message?: string) {
    this.ref = this.dialog.open(DialogLoadingComponent, {
      disableClose: true,
      panelClass: 'transparent-dialog',
      data: message,
    });
  }

  public finish() {
    this.ref?.close();
  }

  public isLoading() {
    return this.ref && this.ref.componentInstance;
  }
}
