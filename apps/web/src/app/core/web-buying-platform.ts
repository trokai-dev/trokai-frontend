import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Clothes } from '@trokai/shared-core';
import {
  CheckoutAnalytics,
  CheckoutNavigator,
} from '@trokai/shared-data-access';
import { TrokaiGtmService } from '../services/trokai-gtm.service';

/** Web checkout navigation — Angular Router multi-step pages. */
@Injectable()
export class WebCheckoutNavigator extends CheckoutNavigator {
  private router = inject(Router);

  toShipping() {
    this.router.navigateByUrl('/buying/checkout/shipping');
  }
  toShippingAddress() {
    this.router.navigateByUrl('/buying/checkout/shipping-address');
  }
  toPaymentOptions() {
    this.router.navigateByUrl('/buying/checkout/payment-options');
  }
  toInstallments() {
    this.router.navigateByUrl('/buying/checkout/installments');
  }
  toReview() {
    this.router.navigateByUrl('/buying/checkout/review');
  }
  toNewCard() {
    this.router.navigateByUrl('/buying/checkout/new-card');
  }
}

/** Web checkout analytics — Google Tag Manager. */
@Injectable()
export class WebCheckoutAnalytics extends CheckoutAnalytics {
  private gtm = inject(TrokaiGtmService);

  override addToCart(product: Clothes) {
    this.gtm.addToCartEvent(product);
  }
  override beginCheckout(total: number, items: Clothes[]) {
    this.gtm.beginCheckoutEvent(total, items);
  }
  override addPaymentInfo() {
    this.gtm.addPaymentInfoEvent();
  }
  override purchase(orderId: string, valueBRL: number, items: Clothes[]) {
    this.gtm.purchaseEvent(orderId, valueBRL, items);
  }
}
