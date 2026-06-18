import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'tk-dialog-loading',
  templateUrl: './dialog-loading.component.html',
  styleUrls: ['./dialog-loading.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatProgressSpinnerModule],
})
export class DialogLoadingComponent {
  public dialogRef = inject(MatDialogRef<DialogLoadingComponent>);
  public message = inject<string>(MAT_DIALOG_DATA, { optional: true });
}
