import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SellerFees } from '@trokai/shared-core';
import { CostPipe } from '../../pipes/cost.pipe';

export interface FeesCalculatorData {
  sellerFees: SellerFees;
  productCost: number;
  declaredValue: boolean;
}

@Component({
  selector: 'tk-fees-calculator',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
    CurrencyPipe,
    CostPipe,
  ],
  templateUrl: './tk-fees-calculator.component.html',
  styleUrl: './tk-fees-calculator.component.scss',
})
export class TkFeesCalculatorComponent implements OnInit {
  sellerFees!: SellerFees;
  productCost!: number;
  declaredValue!: boolean;
  sellerProfit = 0;

  public dialogRef = inject(MatDialogRef<TkFeesCalculatorComponent>);
  public data = inject<FeesCalculatorData>(MAT_DIALOG_DATA);

  ngOnInit() {
    if (!this.data.sellerFees) {
      this.dialogRef.close();
      return;
    }
    this.declaredValue = this.data.declaredValue;
    this.productCost = this.data.productCost;
    this.sellerFees = this.data.sellerFees;
    this.sellerProfit =
      this.productCost - this.productCost * this.sellerFees.sellerPercentageFee;
    if (this.declaredValue)
      this.sellerProfit -= this.sellerFees.declaredValueFee;
  }
}
