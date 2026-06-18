import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DialogAlertData {
  success?: boolean;
  error?: boolean;
  warning?: boolean;
  title?: string;
  text?: string;
  btnText?: string;
  btnOkText?: string;
  btnNoText?: string;
  dialogQuestion?: boolean;
  danger?: boolean;
}

@Component({
  selector: 'tk-dialog-alert',
  templateUrl: './dialog-alert.component.html',
  styleUrls: ['./dialog-alert.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class DialogAlertComponent {
  public dialogRef = inject(MatDialogRef<DialogAlertComponent>);
  public data = inject<DialogAlertData>(MAT_DIALOG_DATA);

  close(action: any): void {
    this.dialogRef.close({ response: action });
  }
}
