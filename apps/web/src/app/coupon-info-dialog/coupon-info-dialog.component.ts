import { Component, inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Coupon } from '@trokai/shared-data-access';
import { AlertService } from '@trokai/shared-ui';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-coupon-info-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './coupon-info-dialog.component.html',
  styleUrl: './coupon-info-dialog.component.scss',
})
export class CouponInfoDialogComponent {
  public data = inject<{ coupon: Coupon }>(MAT_DIALOG_DATA);
  private clipboard = inject(Clipboard);
  private alert = inject(AlertService);
  public dialogRef = inject(MatDialogRef<CouponInfoDialogComponent>);

  copyCode() {
    this.clipboard.copy(this.data.coupon.code);
    this.alert.alert('Cupom copiado');
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
