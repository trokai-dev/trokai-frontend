import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  Address,
  NavigationManager,
  equalAddresses,
} from '@trokai/shared-core';
import { BuyingService } from '@trokai/shared-data-access';
import { LoadingService } from '../../loading/loading.service';
import { UserService } from '@trokai/shared-data-access';
import { TkAddressFormComponent } from '../address-form/tk-address-form.component';

@Component({
  selector: 'tk-shipping-address',
  standalone: true,
  imports: [MatButtonModule, TkAddressFormComponent],
  template: `
    <h3 class="checkout-title">Endereço de entrega</h3>
    <div class="checkout-body">
      <tk-address-form [submit]="false" />
    </div>
    <div class="checkout-footer mt-40">
      <button
        mat-flat-button
        color="primary"
        (click)="onContinue()"
        [disabled]="!formRef?.form.valid"
      >
        Continuar
      </button>
    </div>
  `,
})
export class TkShippingAddressComponent implements AfterViewInit {
  @ViewChild(TkAddressFormComponent) formRef!: TkAddressFormComponent;

  private navManager = inject(NavigationManager);
  private userService = inject(UserService);
  private buyingService = inject(BuyingService);
  private loading = inject(LoadingService);

  private currentAddress?: Address;

  ngAfterViewInit() {
    const user = this.navManager.currentUser();
    if (user?.address) {
      const a = user.address;
      this.formRef.form.patchValue({
        ...a,
        zipCode: a.zipCode?.toString(),
        number: a.number?.toString(),
      });
      this.currentAddress = user.address;
    }
  }

  async onContinue() {
    if (!this.formRef.form.valid) return;

    const v = this.formRef.form.value;
    const zipCode = +v.zipCode!.toString().replace('-', '');
    const address: Address = {
      zipCode,
      street: v.street!,
      number: v.number ? +v.number : undefined,
      complement: v.complement || undefined,
      neighborhood: v.neighborhood!,
      city: v.city!,
      state: v.state!,
      country: 'BRA',
    };
    if (!address.complement) delete address.complement;

    try {
      this.loading.start();
      if (!equalAddresses(address, this.currentAddress!)) {
        await this.userService.updateUser({ address });
        await this.navManager.syncUserData();
        await this.buyingService.afterAddressUpdate();
      }
      this.buyingService.navigateCheckout();
    } finally {
      this.loading.finish();
    }
  }
}
