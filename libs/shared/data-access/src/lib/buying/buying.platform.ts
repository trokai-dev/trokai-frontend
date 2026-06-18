import { Injectable } from '@angular/core';
import { Clothes } from '@trokai/shared-core';

/**
 * Platform abstractions injected into the shared `BuyingService`. Each app
 * provides a concrete implementation so the checkout business logic stays
 * platform-agnostic (web = Router/localStorage/GTM, app = Ionic/Capacitor).
 */

/** Imperative checkout-step navigation. Web routes to its multi-step pages;
 *  app routes to its single checkout page. */
@Injectable()
export abstract class CheckoutNavigator {
  abstract toShipping(): void;
  abstract toShippingAddress(): void;
  abstract toPaymentOptions(): void;
  abstract toInstallments(): void;
  abstract toReview(): void;
  abstract toNewCard(): void;
}

/** Checkout analytics. Web is GTM-backed; app is a no-op by default. */
@Injectable()
export class CheckoutAnalytics {
  /* eslint-disable @typescript-eslint/no-empty-function */
  addToCart(_product: Clothes): void {}
  beginCheckout(_total: number, _items: Clothes[]): void {}
  addPaymentInfo(): void {}
  purchase(_orderId: string, _valueBRL: number, _items: Clothes[]): void {}
  /* eslint-enable @typescript-eslint/no-empty-function */
}
