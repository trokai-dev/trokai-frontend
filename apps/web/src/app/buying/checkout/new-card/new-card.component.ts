import { Component, ViewChild, inject } from '@angular/core';

import { NavigationManager, User } from '@trokai/shared-core';
import { TkCardFormComponent } from '@trokai/shared-ui';
import { MatButtonModule } from '@angular/material/button';
import { BuyingService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-new-card',
  standalone: true,
  imports: [TkCardFormComponent, MatButtonModule],
  templateUrl: './new-card.component.html',
  styleUrl: './new-card.component.scss',
})
export class NewCardComponent {
  private buyingService = inject(BuyingService);
  private nav = inject(NavigationManager);

  @ViewChild(TkCardFormComponent) cardForm!: TkCardFormComponent;

  user: User | undefined | null = this.nav.currentUser();

  async onContinue() {
    const checkoutLocal = this.buyingService.getCheckoutLocalValue();
    if (!checkoutLocal) return;

    const card = await this.cardForm.save();
    if (!card) return;
    checkoutLocal.cardId = card._id;

    this.buyingService.setCheckoutLocal(checkoutLocal);
    this.buyingService.navigateCheckout();
  }
}
