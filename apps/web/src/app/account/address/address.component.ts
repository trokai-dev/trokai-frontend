import { Address } from '@trokai/shared-core';
import { AlertService, TkAddressFormComponent } from '@trokai/shared-ui';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit, inject } from '@angular/core';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [TkAddressFormComponent],
  template: `
    <div class="address">
      <h3 class="color-gray-dark">Endereço</h3>
      <tk-address-form [address]="address" (addressSave)="save($event)" />
    </div>
  `,
  styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit {
  private authService = inject(AuthService);
  private alert = inject(AlertService);
  private completingInfo = inject(CompletingInformationService);

  address?: Address;

  ngOnInit(): void {
    this.authService.user$.subscribe((u) => {
      if (u) this.address = u.address;
    });
  }

  async save(address: Address) {
    try {
      await this.authService.updateAddress(address);
      this.alert.postSuccess();
      this.completingInfo.next();
    } catch {
      /* intentional */
    }
  }
}
