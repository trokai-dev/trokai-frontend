import { Component, OnInit, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CheckoutValues, UserFee } from '@trokai/shared-data-access';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlertService, CostPipe } from '@trokai/shared-ui';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checkout-total-details',
  standalone: true,
  imports: [
    CostPipe,
    CurrencyPipe,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './checkout-total-details.component.html',
  styleUrl: './checkout-total-details.component.scss',
})
export class CheckoutTotalDetailsComponent implements OnInit {
  private alert = inject(AlertService);
  private dialogRef = inject(MatDialogRef<CheckoutTotalDetailsComponent>);
  public data = inject<CheckoutValues>(MAT_DIALOG_DATA);

  cv?: CheckoutValues;

  ngOnInit() {
    if (!this.data) this.dialogRef.close();
    this.cv = this.data;
  }

  showFeeInfo(fee: UserFee) {
    if (fee.description) this.alert.showDialog(fee.name, fee.description);
  }
}
