import { Card, User } from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { PaymentIconComponent } from '../../../payment-icon/payment-icon.component';
import { CheckoutTotalComponent } from '../checkout-total/checkout-total.component';
import { takeUntil } from 'rxjs';
import { AutoUnsubscribe } from 'src/app/autounsubscribe';
import {
  CheckoutValues,
  BuyingService,
  CheckoutLocal,
  PaymentOption,
  AddressOption,
  CheckoutResponse,
} from '@trokai/shared-data-access';
import { AuthService } from 'src/app/auth/auth.service';
import { CartItemComponent } from 'src/app/modules/cart-item/cart-item.component';
import { NgxMaskPipe } from 'ngx-mask';
import { LoadingService } from '@trokai/shared-ui';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-review',
  standalone: true,
  imports: [
    MatButtonModule,
    PaymentIconComponent,
    CheckoutTotalComponent,
    CartItemComponent,
    NgxMaskPipe,
  ],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.scss',
})
export class CheckoutReviewComponent extends AutoUnsubscribe implements OnInit {
  private buyingService = inject(BuyingService);
  private authService = inject(AuthService);
  private loading = inject(LoadingService);
  private router = inject(Router);

  cv?: CheckoutValues;
  checkoutLocal!: CheckoutLocal;
  checkoutResponse!: CheckoutResponse;
  paymentOptions = PaymentOption;
  shippingOptions = AddressOption;
  card?: Card;

  user?: User;

  ngOnInit(): void {
    this.authService.user.subscribe((user) => (this.user = user));

    this.buyingService.checkoutLocal$
      .pipe(takeUntil(this.destroySignal))
      .subscribe(() => this.mount());

    this.buyingService.checkoutResponse$
      .pipe(takeUntil(this.destroySignal))
      .subscribe(() => this.mount());
  }

  mount() {
    const checkoutLocal = this.buyingService.getCheckoutLocalValue();
    const checkoutResponse = this.buyingService.getCheckoutResponseValue();

    if (!checkoutLocal || !checkoutResponse) return;

    this.checkoutLocal = checkoutLocal;
    this.cv = checkoutResponse.getAll(checkoutLocal) ?? undefined;
    if (
      checkoutLocal.cardId &&
      checkoutLocal.paymentOption == PaymentOption.CREDIT_CARD
    ) {
      const user = this.authService.getUserValue();
      if (!user) return;

      this.card = user.cards.find((c) => c._id === checkoutLocal.cardId);
    }
  }

  onChangePayment() {
    this.buyingService.goToPaymentOptions();
  }

  onChangeShipping() {
    this.buyingService.goToShipping();
  }

  async onBuy() {
    try {
      this.loading.start();
      const res = await this.buyingService.buy();
      if (res) this.router.navigateByUrl(`/orders/purchases/${res.orderId}`);
    } finally {
      this.loading.finish();
    }
  }
}
