import { Address, User } from '@trokai/shared-core';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  IonNav,
  NavController,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { AddressPage } from 'src/app/address/address.page';
import { AuthService } from 'src/app/services/auth.service';
import { MainService } from 'src/app/services/main.service';
import { environment } from 'src/environments/environment';
import {
  AddressOption,
  BuyingService,
  CheckoutLocal,
  CheckoutResponse,
} from '@trokai/shared-data-access';
import { CheckoutPage } from '../checkout/checkout.page';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { NgClass, CurrencyPipe } from '@angular/common';
import { TkReserveTimeComponent } from '@trokai/shared-features';
import { NgxMaskPipe } from 'ngx-mask';
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ToastService } from 'src/app/services/toast-service';
import { LoadingService, CostPipe } from '@trokai/shared-ui';

@Component({
  selector: 'app-shipping-options',
  templateUrl: './shipping-options.page.html',
  styleUrls: ['./shipping-options.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    MatRadioModule,
    MatButtonModule,
    BackButtonComponent,
    NgClass,
    TkReserveTimeComponent,
    CurrencyPipe,
    CostPipe,
    NgxMaskPipe,
  ],
})
export class ShippingOptionsPage implements OnInit, OnDestroy {
  enumAddress = AddressOption;

  checkoutLocal: CheckoutLocal;
  checkoutResponse: CheckoutResponse;
  user: User;

  url = environment.imageURL;
  shippingAddress: Address;

  checkoutLocalSub: Subscription;
  checkoutResponseSub: Subscription;
  userSub: Subscription;

  leavingToConfirm;
  shouldReload = false;

  private buyingService = inject(BuyingService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private mainService = inject(MainService);
  private ionNav = inject(IonNav);
  private navCtrl = inject(NavController);
  private loadingService = inject(LoadingService);

  ngOnInit() {
    this.checkoutLocalSub = this.buyingService.checkoutLocal$.subscribe((c) =>
      this.onCheckoutLocalChange(c),
    );

    this.checkoutResponseSub = this.buyingService.checkoutResponse$.subscribe(
      (c) => this.onCheckoutResponseChange(c),
    );

    this.userSub = this.authService.user$.subscribe((u) => {
      this.user = u;
      this.load();
    });
  }

  onCheckoutLocalChange(data: CheckoutLocal) {
    if (!data?.products?.length && this.checkoutLocal?.products?.length > 0) {
      this.mainService.navigateToCarts();
      this.checkoutLocal = null;
    } else {
      this.checkoutLocal = data;
    }
  }

  onCheckoutResponseChange(data: CheckoutResponse) {
    if (!data) return;
    this.checkoutResponse = data;

    if (!this.checkoutLocal.shippingOption) {
      if (this.checkoutResponse.shipping)
        this.checkoutLocal.shippingOption = AddressOption.SHIPPING;
      else if (this.checkoutResponse.inPerson)
        this.checkoutLocal.shippingOption = AddressOption.INPERSON;

      this.buyingService.setCheckoutLocal(this.checkoutLocal);
    }
  }

  async load() {
    try {
      if (!this.user) return;

      if (!this.checkoutLocal) {
        this.mainService.navigateToCarts();
        return;
      }

      if (this.checkoutLocal.shippingOption == undefined) {
        if (
          this.checkoutLocal.owner.seller?.shipping &&
          !this.checkoutLocal.owner.seller?.inPerson
        ) {
          this.changeAddressOption(this.enumAddress.SHIPPING);
        } else if (
          !this.checkoutLocal.owner.seller?.shipping &&
          this.checkoutLocal.owner.seller?.inPerson
        ) {
          this.changeAddressOption(this.enumAddress.INPERSON);
        }
      }
    } catch {
      /* intentional */
    }
  }

  async ionViewDidEnter() {
    try {
      if (this.shouldReload) {
        this.loadingService.start('Carregando...');
        await this.buyingService.getCheckoutData();
        this.shouldReload = false;
      }
    } finally {
      this.loadingService.finish();
    }
  }

  async openAddressForm() {
    this.leavingToConfirm = true;
    await this.ionNav.push(AddressPage, { buying: true });
    this.shouldReload = true;
  }

  changeAddressOption(value: AddressOption) {
    this.checkoutLocal.shippingOption = value;
    this.buyingService.setCheckoutLocal(this.checkoutLocal);
  }

  validate(): boolean {
    if (this.checkoutLocal.shippingOption == null) {
      this.toast.makeToast('Escolha a opção de entrega');
      return false;
    }

    return true;
  }

  async clickBack() {
    if (await this.ionNav.canGoBack()) this.ionNav.pop();
    else this.navCtrl.back();
  }

  continue() {
    if (!this.validate()) return;
    this.ionNav.push(CheckoutPage);
  }

  ngOnDestroy(): void {
    if (this.checkoutLocalSub) this.checkoutLocalSub.unsubscribe();
    if (this.checkoutResponseSub) this.checkoutResponseSub.unsubscribe();
    if (this.userSub) this.userSub.unsubscribe();
  }
}
