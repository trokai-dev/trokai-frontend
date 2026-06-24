import { User } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';

import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import {
  AddressOption,
  BuyingService,
  CheckoutLocal,
} from '@trokai/shared-data-access';
import { AuthService } from 'src/app/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { NgxMaskPipe } from 'ngx-mask';
import { takeUntil } from 'rxjs';
import { AutoUnsubscribe } from 'src/app/autounsubscribe';

@Component({
  selector: 'app-shipping-options',
  standalone: true,
  imports: [MatRadioModule, MatButtonModule, FormsModule, NgxMaskPipe],
  templateUrl: './shipping-options.component.html',
  styleUrl: './shipping-options.component.scss',
})
export class ShippingOptionsComponent
  extends AutoUnsubscribe
  implements OnInit
{
  private buyingService = inject(BuyingService);
  private authService = inject(AuthService);

  shipping = false;
  inPerson = false;

  checkout!: CheckoutLocal;
  user!: User;

  selectedOption?: AddressOption;
  shippingOptions = AddressOption;

  ngOnInit() {
    this.buyingService.checkoutLocal$
      .pipe(takeUntil(this.destroySignal))
      .subscribe((checkout) => {
        if (!checkout) return;

        this.checkout = checkout;

        // checkout.owner.inPerson = true; // TODO: remove this line

        this.shipping = checkout.owner.seller?.shipping ?? false;
        this.inPerson = checkout.owner.seller?.inPerson ?? false;

        if (this.inPerson && !this.shipping)
          // only inPerson
          this.selectedOption = AddressOption.INPERSON;

        if (this.shipping && !this.inPerson)
          // only shipping
          this.selectedOption = AddressOption.SHIPPING;
      });

    this.authService.user$
      .pipe(takeUntil(this.destroySignal))
      .subscribe((user) => {
        if (!user) return;
        this.user = user;
      });
  }

  onChangeAddress(event: Event) {
    event.stopPropagation();
    this.buyingService.goToAddAddress();
  }

  async onContinue() {
    if (this.selectedOption == null) return;
    this.checkout.shippingOption = this.selectedOption;
    this.buyingService.setCheckoutLocal(this.checkout);
    await this.buyingService.navigateCheckout();
  }
}
