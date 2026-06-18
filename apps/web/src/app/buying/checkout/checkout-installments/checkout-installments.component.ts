import { CostPipe } from '@trokai/shared-ui';
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  BuyingService,
  CheckoutLocal,
  CheckoutValues,
} from '@trokai/shared-data-access';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checkout-installments',
  standalone: true,
  imports: [
    MatRadioModule,
    FormsModule,
    CostPipe,
    CurrencyPipe,
    MatButtonModule,
  ],
  templateUrl: './checkout-installments.component.html',
  styleUrl: './checkout-installments.component.scss',
})
export class CheckoutInstallmentsComponent implements OnInit {
  private buyingService = inject(BuyingService);

  selectedInstallments = 1;
  cv?: CheckoutValues;

  checkoutLocal!: CheckoutLocal;

  ngOnInit() {
    const checkoutLocal = this.buyingService.getCheckoutLocalValue();
    const checkoutResponse = this.buyingService.getCheckoutResponseValue();
    if (!checkoutLocal || !checkoutResponse) return;

    this.checkoutLocal = checkoutLocal;
    this.cv = checkoutResponse.getAll(checkoutLocal) ?? undefined;
    this.selectedInstallments = checkoutLocal.selectedInstallments;
  }

  onContinue() {
    if (!this.selectedInstallments) return;

    this.checkoutLocal.selectedInstallments = this.selectedInstallments;

    this.buyingService.setCheckoutLocal(
      {
        ...this.checkoutLocal,
        selectedInstallments: this.selectedInstallments,
      },
      false,
    );

    this.buyingService.navigateCheckout();
  }
}
