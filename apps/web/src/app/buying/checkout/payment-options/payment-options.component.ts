import { CostPipe } from '@trokai/shared-ui';
import { CurrencyPipe } from '@angular/common';
import { Card } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaymentIconComponent } from '../../../payment-icon/payment-icon.component';
import { PaymentBrands } from '@trokai/shared-core';
import { AuthService } from 'src/app/auth/auth.service';
import {
  BuyingService,
  CheckoutLocal,
  CheckoutResponse,
  Installment,
  PaymentOption,
} from '@trokai/shared-data-access';
import { FormsModule } from '@angular/forms';
import { FormCouponComponent } from '../../../modules/form-coupon/form-coupon.component';
import { CheckoutTotalComponent } from '../checkout-total/checkout-total.component';
import { AutoUnsubscribe } from 'src/app/autounsubscribe';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    PaymentIconComponent,
    FormCouponComponent,
    CostPipe,
    CurrencyPipe,
    CheckoutTotalComponent,
  ],
  templateUrl: './payment-options.component.html',
  styleUrl: './payment-options.component.scss',
})
export class PaymentOptionsComponent extends AutoUnsubscribe implements OnInit {
  private authService = inject(AuthService);
  private buyingService = inject(BuyingService);

  paymentBrands = PaymentBrands;
  paymentOptions = PaymentOption;

  cards: Card[] = [];

  selectedOption: PaymentOption | string | null = null;

  checkoutResponse!: CheckoutResponse;
  checkoutLocal!: CheckoutLocal;

  installmentString = '';

  pixDiscount = 0;
  pixDiscountPercent = 0;

  couponCode!: string;

  maxNoInterest?: Installment;
  maxInstallments?: Installment;

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.cards = user?.cards || [];
    });

    this.buyingService.checkoutResponse$
      .pipe(takeUntil(this.destroySignal))
      .subscribe((checkoutResponse) => {
        if (!checkoutResponse) return;
        this.checkoutResponse = checkoutResponse;
        this.mountInstallmentString();
      });

    this.buyingService.checkoutLocal$
      .pipe(takeUntil(this.destroySignal))
      .subscribe((checkoutLocal) => {
        if (!checkoutLocal) return;

        this.checkoutLocal = checkoutLocal;

        if (checkoutLocal.paymentOption == null) {
          this.selectedOption = PaymentOption.PIX;
          // set without storing
          this.buyingService.setCheckoutLocal(
            { ...checkoutLocal, paymentOption: PaymentOption.PIX },
            false,
          );
        } else if (
          checkoutLocal.paymentOption === PaymentOption.CREDIT_CARD &&
          checkoutLocal.cardId
        ) {
          this.selectedOption = checkoutLocal.cardId;
        } else if (checkoutLocal.paymentOption === PaymentOption.PIX) {
          this.selectedOption = PaymentOption.PIX;
        }

        this.mountInstallmentString();
      });
  }

  changePaymentOption(event: MatRadioChange) {
    let paymentOption;
    let selectedCard;

    if (event.value === PaymentOption.PIX) {
      paymentOption = PaymentOption.PIX;
    } else {
      paymentOption = PaymentOption.CREDIT_CARD;

      if (typeof event.value === 'string')
        selectedCard = this.cards.find((card) => card._id === event.value);
    }

    this.buyingService.setCheckoutLocal(
      {
        ...this.checkoutLocal,
        paymentOption,
        cardId: selectedCard?._id,
      },
      false,
    );
  }

  mountInstallmentString() {
    if (!this.checkoutResponse || !this.checkoutLocal) return;

    const installments = this.checkoutResponse.getInstallments(
      this.checkoutLocal.shippingOption,
      PaymentOption.CREDIT_CARD,
    );

    this.maxNoInterest = installments.filter((b) => b.interest == 0).at(-1);
    this.maxInstallments = installments.at(-1);
  }

  onContinue() {
    if (this.selectedOption == null) {
      this.buyingService.goToNewCard();
      return;
    }

    this.checkoutLocal.paymentOption = this.selectedOption as PaymentOption;

    if (this.selectedOption === PaymentOption.PIX) {
      this.checkoutLocal.cardId = undefined;
      this.checkoutLocal.selectedInstallments = 1;
      this.buyingService.setCheckoutLocal(this.checkoutLocal, false);
      this.buyingService.navigateCheckout();
      return;
    }

    this.checkoutLocal.cardId = this.selectedOption;
    this.checkoutLocal.paymentOption = PaymentOption.CREDIT_CARD;
    this.buyingService.setCheckoutLocal(this.checkoutLocal, false);
    this.buyingService.navigateCheckout(true);
  }
}
