import { CostPipe } from '@trokai/shared-ui';
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { BuyingService, CheckoutValues } from '@trokai/shared-data-access';
import { AutoUnsubscribe } from 'src/app/autounsubscribe';
import { takeUntil } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-checkout-total',
  standalone: true,
  imports: [CostPipe, CurrencyPipe],
  templateUrl: './checkout-total.component.html',
  styleUrl: './checkout-total.component.scss',
})
export class CheckoutTotalComponent extends AutoUnsubscribe implements OnInit {
  private buyingService = inject(BuyingService);
  private dialogService = inject(DialogService);

  cv?: CheckoutValues;

  ngOnInit() {
    this.buyingService.checkoutLocal$
      .pipe(takeUntil(this.destroySignal))
      .subscribe(() => this.calculate());

    this.buyingService.checkoutResponse$
      .pipe(takeUntil(this.destroySignal))
      .subscribe(() => this.calculate());
  }

  calculate() {
    const checkoutLocal = this.buyingService.getCheckoutLocalValue();
    const checkoutResponse = this.buyingService.getCheckoutResponseValue();

    if (!checkoutLocal || !checkoutResponse) return;
    this.cv = checkoutResponse.getAll(checkoutLocal) ?? undefined;
  }

  async openDetails() {
    if (!this.cv) return;
    this.dialogService.openCheckoutValues(this.cv);
  }
}
