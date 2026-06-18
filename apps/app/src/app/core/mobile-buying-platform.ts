import { inject, Injectable } from '@angular/core';
import { CheckoutNavigator } from '@trokai/shared-data-access';
import { MainService } from '../services/main.service';

/**
 * Mobile checkout navigation. The app drives the whole checkout from a single
 * page (`/buying/checkout`), so every step routes there — the page itself shows
 * the relevant section.
 */
@Injectable()
export class MobileCheckoutNavigator extends CheckoutNavigator {
  private mainService = inject(MainService);

  private toCheckout() {
    this.mainService.navigateToCheckout();
  }
  toShipping() {
    this.toCheckout();
  }
  toShippingAddress() {
    this.toCheckout();
  }
  toPaymentOptions() {
    this.toCheckout();
  }
  toInstallments() {
    this.toCheckout();
  }
  toReview() {
    this.toCheckout();
  }
  toNewCard() {
    this.toCheckout();
  }
}
