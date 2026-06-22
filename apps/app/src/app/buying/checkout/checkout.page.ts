import { Address, User } from '@trokai/shared-core';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ItemViewerComponent } from 'src/app/shared/components/item-viewer/item-viewer.component';
import {
  AddressOption,
  BuyingService,
  CheckoutLocal,
  CheckoutResponse,
  Installment,
  PaymentOption,
  UserFee,
  UserFeeType,
} from '@trokai/shared-data-access';

import { OrdersService } from '@trokai/shared-data-access';
import { MainService } from 'src/app/services/main.service';
import { NewCardPage } from '../new-card/new-card.page';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReserveTimeComponent } from '../reserve-time/reserve-time.component';
import {
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  LoadingController,
  ModalController,
  IonThumbnail,
  IonImg,
  IonItem,
  IonIcon,
  IonNav,
  NavController,
} from '@ionic/angular/standalone';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

import { addIcons } from 'ionicons';
import { cardOutline, closeOutline, helpCircleOutline } from 'ionicons/icons';
import { ToastService } from 'src/app/services/toast-service';
import { Router } from '@angular/router';
import { LoadingService, CostPipe } from '@trokai/shared-ui';
import { TkCouponFormComponent } from '@trokai/shared-ui';
import { AlertService } from '@trokai/shared-ui';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonFooter,
    IonItem,
    IonIcon,
    IonContent,
    IonThumbnail,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    IonImg,
    BackButtonComponent,
    FormsModule,
    ReserveTimeComponent,
    CurrencyPipe,
    CostPipe,
    TkCouponFormComponent,
  ],
})
export class CheckoutPage implements OnInit, OnDestroy {
  private buyingService = inject(BuyingService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private mainService = inject(MainService);
  private orderService = inject(OrdersService);
  private ionNav = inject(IonNav);
  private alert = inject(AlertService);
  private navCtrl = inject(NavController);

  @ViewChild(IonContent) content: IonContent;
  user: User;

  leavingToConfirm;

  // enums
  AddressOption = AddressOption;
  PaymentOption = PaymentOption;
  UserFee = UserFee;
  UserFeeType = UserFeeType;

  // shipping
  shippingAddress: Address;

  // payment
  paymentSelected: PaymentOption;

  // checkout data
  checkoutLocal?: CheckoutLocal;
  checkoutResponse?: CheckoutResponse;

  // subscriptions
  checkoutLocalSub: Subscription;
  checkoutResponseSub: Subscription;
  userSub: Subscription;

  // toggles
  showFormAddress = false;
  showFormCoupon = false;

  // sums
  installments: Installment[] = [];
  fees = [];
  sumFees = 0;
  sumCart = 0;
  discount = 0;
  sumTotal = 0;
  interest = 0;

  pixDiscount = 0;
  pixDiscountPercent = 0;

  couponCode: string;
  fullShippingCost;

  async ngOnInit() {
    addIcons({ closeOutline, cardOutline, helpCircleOutline });
    this.checkoutLocal = this.buyingService.getCheckoutLocalValue();

    this.checkoutLocalSub = this.buyingService.checkoutLocal$.subscribe((c) =>
      this.onCheckoutLocalChange(c),
    );

    this.checkoutResponseSub = this.buyingService.checkoutResponse$.subscribe(
      (c) => this.onCheckoutResponseChange(c),
    );

    this.userSub = this.authService.user.subscribe((u) => (this.user = u));

    if (!this.checkoutLocal) {
      this.mainService.navigateToCarts();
      return;
    } else {
      this.checkoutResponse = this.buyingService.getCheckoutResponseValue();
      if (!this.checkoutResponse) await this.buyingService.getCheckoutData();
    }

    this.calculate();
  }

  onCheckoutLocalChange(data: CheckoutLocal) {
    if (!data?.products?.length && this.checkoutLocal?.products?.length > 0) {
      // if cart is empty, redirect to carts
      this.mainService.navigateToCarts();
      this.checkoutLocal = null;
    } else {
      this.checkoutLocal = data;
      this.calculate();
    }
  }

  onCheckoutResponseChange(data: CheckoutResponse) {
    if (!data) return;
    this.checkoutResponse = data;

    // if shipping option is not set, set to first option
    if (!this.checkoutLocal.shippingOption) {
      if (this.checkoutResponse.shipping)
        this.checkoutLocal.shippingOption = AddressOption.SHIPPING;
      else if (this.checkoutResponse.inPerson)
        this.checkoutLocal.shippingOption = AddressOption.INPERSON;

      this.buyingService.setCheckoutLocal(this.checkoutLocal);
    }

    this.calculate();
  }

  calculate() {
    if (!this.checkoutLocal || !this.checkoutResponse) return;

    const { shippingOption, paymentOption } = this.checkoutLocal;

    this.sumCart = this.buyingService.getCartProductsTotal();

    this.discount = this.checkoutResponse.getDiscount(
      shippingOption,
      paymentOption,
    );

    this.pixDiscountPercent = this.checkoutResponse.getPixDiscountPercentage(
      this.checkoutLocal.shippingOption,
    );

    this.fees =
      this.checkoutResponse.getFees(shippingOption, paymentOption) ?? [];

    this.sumFees = this.fees?.reduce((acc, fee) => acc + fee.value, 0) ?? 0;

    if (this.checkoutLocal.paymentOption === PaymentOption.PIX)
      this.pixDiscount = this.checkoutResponse.getPixDiscount(
        this.checkoutLocal.shippingOption,
      );
    else this.pixDiscount = 0;

    this.interest =
      paymentOption === PaymentOption.CREDIT_CARD
        ? this.checkoutResponse.getCreditCardInterest(
            this.checkoutLocal.shippingOption,
            this.checkoutLocal.selectedInstallments,
          )
        : 0;

    // TODO: simplificar aqui usando o proprio objeto e buyerCost
    this.sumTotal =
      this.sumCart +
      this.sumFees +
      this.interest -
      this.discount -
      this.pixDiscount;

    // desconto de frete (fullShippingCost é o valor sem subsidio)
    if (this.checkoutResponse.shipping.shippingValues.fullShippingCost) {
      this.fullShippingCost =
        this.checkoutResponse.shipping.shippingValues.fullShippingCost;
    }

    if (shippingOption == null) return;

    this.installments = this.checkoutResponse.getInstallments(
      shippingOption,
      paymentOption,
    );
  }

  showFeeInfo(fee: UserFee) {
    if (fee.description) this.alert.showAlert(fee.name, fee.description);
  }

  cardSelected(card) {
    this.checkoutLocal.cardId = card?._id;
  }

  installmentsSelected(installments) {
    this.checkoutLocal.selectedInstallments = installments;
    this.calculate();
  }

  changePaymentOption(option: PaymentOption) {
    this.checkoutLocal.paymentOption = option;
    this.buyingService.setCheckoutLocal(this.checkoutLocal);
    this.calculate();
  }

  validate(): boolean {
    const { shippingOption, paymentOption, cardId, selectedInstallments } =
      this.checkoutLocal;

    if (this.loading.isLoading()) return false;

    if (shippingOption == null) {
      this.toast.makeToast('Escolha a opção de entrega');
      return false;
    }

    if (paymentOption == null) {
      this.toast.makeToast('Selecione um método de pagamento');
      return false;
    }

    if (paymentOption == PaymentOption.CREDIT_CARD) {
      if (!cardId) {
        this.toast.makeToast('Selecione um cartão');
        return false;
      }

      if (!selectedInstallments) {
        this.toast.makeToast('Selecione o número de parcelas');
        return false;
      }
    }

    return true;
  }

  async clickBack() {
    if (await this.ionNav.canGoBack()) this.ionNav.pop();
    else this.navCtrl.back();
  }

  async open(product) {
    const modal = await this.modalCtrl.create({
      component: ItemViewerComponent,
      cssClass: 'modal-85',
      componentProps: {
        product: product,
        canFavorite: true,
        canEdit: false,
        canShare: false,
      },
    });

    modal.present();
  }

  newCard() {
    // this.firebaseService.log("COMPRA_ADD_CARTAO");
    this.ionNav.push(NewCardPage, { buying: true });
  }

  async finish() {
    if (!this.validate()) return;

    try {
      this.loading.start();
      // payload is built inside BuyingService from its checkout state (canonical)
      const res = await this.buyingService.buy();
      this.router.navigateByUrl(`/main/negotiations/purchase/${res.orderId}`, {
        replaceUrl: true,
      });
    } finally {
      this.loading.finish();
    }
  }

  ngOnDestroy(): void {
    if (this.checkoutLocalSub) this.checkoutLocalSub.unsubscribe();
    if (this.checkoutResponseSub) this.checkoutResponseSub.unsubscribe();
    if (this.userSub) this.userSub.unsubscribe();
  }
}
