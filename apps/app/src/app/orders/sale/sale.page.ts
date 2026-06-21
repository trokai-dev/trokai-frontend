import { Order } from '@trokai/shared-core';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AddressOption, PaymentOption } from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';
import { OrdersService } from '@trokai/shared-data-access';
import {
  OrderStatus,
  AllowedChatInStatuses as OrderStatusCanChat,
  OrderStatusString,
} from '@trokai/shared-core';
import { ItemViewerComponent } from 'src/app/shared/components/item-viewer/item-viewer.component';
import { CancelSaleComponent } from '../cancel-sale/cancel-sale.component';
import { Clipboard } from '@capacitor/clipboard';
import { Browser } from '@capacitor/browser';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import {
  ModalController,
  NavController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonFooter,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonAvatar,
  IonImg,
  IonRippleEffect,
  IonCol,
  IonRow,
  IonThumbnail,
  IonText,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import { chatbubble, chevronDown, chevronUp } from 'ionicons/icons';
import { ChatComponent } from 'src/app/chat/chat.component';
import { AlertService, CostPipe } from '@trokai/shared-ui';
import { ToastService } from 'src/app/services/toast-service';
import { TutorialService } from 'src/app/services/tutorial.service';
import { MainService } from 'src/app/services/main.service';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';
import { CartItemComponent } from 'src/app/shared/components/cart-item/cart-item.component';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.page.html',
  styleUrls: ['./sale.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    
    IonFooter,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    BackButtonComponent,
    CurrencyPipe,
    DatePipe,
    CostPipe,
    IonButtons,
    IonIcon,
    IonSpinner,
    IonAvatar,
    IonImg,
    IonRippleEffect,
    IonCol,
    IonRow,
    OrderDeliveryComponent,
    CartItemComponent,
  ],
})
export class SalePage implements OnInit, OnDestroy {
  private ordersService = inject(OrdersService);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);
  private mainService = inject(MainService);
  private tutorialService = inject(TutorialService);
  private modalCtrl = inject(ModalController);
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);

  order: Order;
  loading = true;
  url;

  buyerAvatar = null;
  expandedCost = false;

  isShipping;

  loadingPostageLabel = false;

  waiting_shipment = false;
  waiting_withdrawal = false;
  waiting_review = false;
  postageLabelExpired = false;

  postageInfoDate;
  postageInfoStatus;
  showContact = false;

  async ngOnInit() {
    addIcons({ chevronUp, chevronDown, chatbubble });

    const orderId = this.route.snapshot.paramMap.get('order_id');
    if (!orderId) return;

    await this.start(orderId);

    if (this.route.snapshot.paramMap.get('open_chat')) this.chat();

    Browser.addListener('browserFinished', () => this.start(orderId));
  }

  async start(orderId) {
    try {
      this.url = environment.imageURL;
      const res = await this.ordersService.fetchOrder(orderId);
      this.order = new Order(res);

      this.mountStatus();
      this.mountBuyer();

      this.loading = false;
    } catch { /* intentional */ }
  }

  mountStatus() {
    this.isShipping = this.order.shippingType === AddressOption.SHIPPING;
    this.waiting_shipment = this.order.status === OrderStatus.WAITING_SHIPMENT;
    this.waiting_withdrawal =
      this.order.status === OrderStatus.WAITING_WITHDRAWAL;
    this.waiting_review = this.order.status === OrderStatus.WAITING_REVIEW;

    if (this.order.postageLabel && this.order.postageLabel.expirationDate)
      this.postageLabelExpired =
        this.waiting_shipment &&
        new Date(this.order.postageLabel.expirationDate) < new Date();

    if (this.order.postageInfo && this.order.postageInfo.length > 0) {
      const i = this.order.postageInfo.length - 1;
      this.postageInfoDate = this.order.postageInfo[i].date;
      this.postageInfoStatus = this.order.postageInfo[i].status;
    }

    const s = this.order.status;
    this.showContact = OrderStatusCanChat.includes(s);
  }

  async copyPostage() {
    await Clipboard.write({ string: this.order.postageLabel.object });
    this.toastService.makeToast('Código copiado');
  }

  mountBuyer() {
    const buyer: any = this.order.buyer;

    if (buyer.avatar && buyer.avatar != '') {
      this.buyerAvatar =
        environment.imageURL + buyer._id + '/avatar/' + buyer.avatar;
      // } else if (buyer.googleAvatar) {
      //   this.buyerAvatar = buyer.googleAvatar;
    } else {
      this.buyerAvatar = environment.defaultAvatar1;
    }
  }

  async getPostageLabel() {
    if (this.loadingPostageLabel) return;

    this.loadingPostageLabel = true;
    await this.tutorialService.postageLabelTutorial();

    try {
      this.mainService.openTrokaiWebsitePath(
        `/postage-label/${this.order._id}`,
      );
    } finally {
      this.loadingPostageLabel = false;
    }
  }

  async chat() {

    if (!OrderStatusCanChat.includes(this.order.status)) return;

    const modal = await this.modalCtrl.create({
      component: ChatComponent,
      componentProps: {
        otherUser: this.order.buyer,
        negotiationType: 'purchase',
        negotiationId: this.order._id,
        enabled: this.showContact,
      },
    });

    modal.present();
  }

  openOtherUser() {
    this.navCtrl.navigateForward(
      `/main/negotiations/wardrobe/${
        this.order.buyer['_id']
      }/${new Date().getTime()}`,
    );
  }

  async openProduct(product) {
    const modal = await this.modalCtrl.create({
      component: ItemViewerComponent,
      cssClass: 'modal-85',
      componentProps: {
        product: product,
        owner: true,
        buying: false,
        inCart: false,
        canFavorite: false,
        canEdit: false,
        canShare: true,
      },
    });

    modal.present();
  }

  getOrderStatus() {
    return OrderStatusString[this.order.status];
  }

  getPayment() {
    if (this.order.payment.paymentMethod === PaymentOption.CREDIT_CARD) {
      if (this.order.payment.creditCard)
        return (
          this.order.payment.creditCard.installments + 'x no cartão de crédito'
        );
    } else {
      return '';
    }
  }

  goToBank() {
    this.navCtrl.navigateForward('/main/profile/options/bank');
  }

  async cancel() {
    if (!this.waiting_shipment && !this.waiting_withdrawal) return;

    const modal = await this.modalCtrl.create({
      component: CancelSaleComponent,
      componentProps: { order: this.order },
      cssClass: 'modal-85',
    });

    modal.present();
  }

  async copyPhone(text) {
    await Clipboard.write({ string: text });
    this.toastService.makeToast('Telefone copiado');
  }

  async copyMail(text) {
    await Clipboard.write({ string: text });
    this.toastService.makeToast('Email copiado');
  }

  async ngOnDestroy() {
    await Browser.removeAllListeners();
  }
}
