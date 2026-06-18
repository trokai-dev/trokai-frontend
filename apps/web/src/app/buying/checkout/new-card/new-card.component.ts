import { Component, ViewChild, inject } from '@angular/core';

import { FormCardComponent } from '../../../modules/form-card/form-card.component';
import { MatButtonModule } from '@angular/material/button';
import { BuyingService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-new-card',
  standalone: true,
  imports: [FormCardComponent, MatButtonModule],
  templateUrl: './new-card.component.html',
  styleUrl: './new-card.component.scss',
})
export class NewCardComponent {
  private buyingService = inject(BuyingService);

  @ViewChild(FormCardComponent) formCardComponent!: FormCardComponent;

  async onContinue() {
    const checkoutLocal = this.buyingService.getCheckoutLocalValue();
    if (!checkoutLocal) return;

    const card = await this.formCardComponent.save();
    if (!card) return;
    checkoutLocal.cardId = card._id;

    this.buyingService.setCheckoutLocal(checkoutLocal);
    this.buyingService.navigateCheckout();
  }
}
