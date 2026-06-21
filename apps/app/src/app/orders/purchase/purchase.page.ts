import { GlobalParams, Order } from '@trokai/shared-core';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AddressOption, PaymentOption } from '@trokai/shared-data-access';

import { ItemViewerComponent } from 'src/app/shared/components/item-viewer/item-viewer.component';
import { environment } from 'src/environments/environment';
import { OrdersService } from '@trokai/shared-data-access';
import {
  OrderStatus,
  AllowedChatInStatuses as OrderStatusCanChat,
  OrderStatusString,
} from '@trokai/shared-core';
import { Clipboard } from '@capacitor/clipboard';
import { NegotiationReviewComponent } from 'src/app/shared/components/negotiation-review/negotiation-review.component';
import { Subscription } from 'rxjs';

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
  IonRow,
  IonCol,
  IonButtons,
  IonIcon,
  IonRippleEffect,
  IonFooter,
  IonImg,
  IonSpinner,
  IonThumbnail,
  IonAvatar,
} from '@ionic/angular/standalone';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import {
  chatbubble,
  chevronDown,
  chevronUp,
  copyOutline,
} from 'ionicons/icons';
import { ChatComponent } from 'src/app/chat/chat.component';
import { AlertService, CostPipe } from '@trokai/shared-ui';
import { GlobalService } from 'src/app/services/global.service';
import { ToastService } from 'src/app/services/toast-service';
import dayjs from 'dayjs';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';
import { CartItemComponent } from 'src/app/shared/components/cart-item/cart-item.component';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonImg,
    IonFooter,
    IonRippleEffect,
    IonIcon,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    IonButtons,
    IonCol,
    IonRow,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    BackButtonComponent,
    CurrencyPipe,
    DatePipe,
    CostPipe,
    IonAvatar,
    OrderDeliveryComponent,
    CartItemComponent,
  ],
})
export class PurchasePage implements OnInit, OnDestroy {
  private ordersService = inject(OrdersService);
  private globalService = inject(GlobalService);
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  order: Order;
  loading = true;
  url;

  sellerAvatar = null;
  expandedCost = false;

  sellerFinalPercentageApplied = 0;
  finalDeclaredValue = 0;

  isShipping;

  loadingPostageLabel = false;

  waiting_shipment = false;
  waiting_withdrawal = false;
  waiting_review = false;
  waiting_payment = false;

  order_delivered = false;
  userMadeReview = false;
  userMayReturn = false;

  paramsSub: Subscription;
  globalParams: GlobalParams;

  postageInfoStatus;
  postageInfoDate;

  showContact = false;
  discount = null;

  payment_pix = false;
  pixExpiration;

  async ngOnInit() {
    addIcons({ chevronUp, chevronDown, chatbubble, copyOutline });

    const orderId = this.route.snapshot.paramMap.get('order_id');
    if (!orderId) return;

    await this.start(orderId);

    if (this.route.snapshot.paramMap.get('open_chat')) this.chat();

    this.paramsSub = this.globalService.params().subscribe((params) => {
      this.globalParams = params;
      this.mountReturn();
    });
  }

  async start(orderId) {
    try {
      this.url = environment.imageURL;
      const res = await this.ordersService.fetchOrder(orderId);
      this.order = new Order(res);

      this.mountStatus();
      this.mountSeller();
      this.checkReview();
      this.mountReturn();

      this.mountDiscount();

      this.loading = false;
    } catch { /* intentional */ }
  }

  copyPix(event?) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.modalPix();
  }

  mountDiscount() {
    if (!this.order.businessValues) return;

    let discount = 0;

    if (this.order.businessValues.couponDiscount)
      discount += this.order.businessValues.couponDiscount;

    if (this.order.businessValues.pixDiscount)
      discount += this.order.businessValues.pixDiscount;
  }

  mountStatus() {
    this.isShipping = this.order.shippingType === AddressOption.SHIPPING;
    this.waiting_shipment = this.order.status === OrderStatus.WAITING_SHIPMENT;
    this.waiting_withdrawal =
      this.order.status === OrderStatus.WAITING_WITHDRAWAL;
    this.waiting_payment = this.order.status === OrderStatus.WAITING_PAYMENT;
    this.waiting_review = this.order.status === OrderStatus.WAITING_REVIEW;
    this.order_delivered = this.order.status === OrderStatus.ORDER_DELIVERED;

    this.payment_pix = this.order.payment.paymentMethod === PaymentOption.PIX;

    if (this.order.postageInfo && this.order.postageInfo.length > 0) {
      const i = this.order.postageInfo.length - 1;
      this.postageInfoDate = this.order.postageInfo[i].date;
      this.postageInfoStatus = this.order.postageInfo[i].status;
    }

    const s = this.order.status;

    this.showContact = OrderStatusCanChat.includes(s);

    const exp = new Date(this.order.createdAt);
    exp.setMinutes(exp.getMinutes() + 10);
    this.pixExpiration = dayjs(exp).format('HH:mm');
  }

  openOtherUser() {
    this.navCtrl.navigateForward(
      `/main/negotiations/wardrobe/${
        this.order.seller['_id']
      }/${new Date().getTime()}`,
    );
  }

  mountSeller() {
    const seller: any = this.order.seller;

    if (seller.avatar && seller.avatar != '') {
      this.sellerAvatar =
        environment.imageURL + seller._id + '/avatar/' + seller.avatar;
      // } else if (seller.googleAvatar) {
      //   this.sellerAvatar = seller.googleAvatar;
    } else {
      this.sellerAvatar = environment.defaultAvatar1;
    }
  }

  mountReturn() {
    if (!this.globalParams || !this.order || !this.order_delivered) return;

    try {
      const returningLimit = new Date(
        new Date().setDate(
          new Date(this.order.createdAt).getDate() +
            this.globalParams.daysToReturnOrder,
        ),
      );

      const diffInMs = returningLimit.getTime() - new Date().getTime();
      const diffDays = diffInMs / (1000 * 60 * 60 * 24);

      this.userMayReturn = diffDays >= 0;
    } catch (err) {
      console.log(err);
    }
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
    } else if (this.order.payment.paymentMethod === PaymentOption.PIX) {
      return 'PIX';
    }
  }

  async copyPostage() {
    await Clipboard.write({ string: this.order.postageLabel.object });
    this.toastService.makeToast('Código copiado');
  }

  async chat() {
    if (!OrderStatusCanChat.includes(this.order.status)) return;

    const modal = await this.modalCtrl.create({
      component: ChatComponent,
      componentProps: {
        otherUser: this.order.seller,
        negotiationType: 'sale',
        negotiationId: this.order._id,
        enabled: this.showContact,
      },
    });

    modal.present();
  }

  async openProduct(product) {
    const modal = await this.modalCtrl.create({
      component: ItemViewerComponent,
      cssClass: 'modal-85',
      componentProps: {
        product: product,
        owner: false,
        buying: false,
        inCart: false,
        canFavorite: true,
        canEdit: false,
        canShare: true,
      },
    });

    modal.present();
  }

  async confirmWithdrawal() {
    const res = await this.alertService.askQuestion(
      'Já se encontrou?',
      'Apenas confirme quando estiver com os produtos em mãos.',
    );
    if (!res) return;

    this.loading = true;

    try {
      await this.ordersService.confirmLocalWithdrawal(this.order._id);
      await this.start(this.order._id);
    } finally {
      this.loading = false;
    }
  }

  async checkReview() {
    if (this.order.reviews && this.order.reviews.length === 2) {
      this.userMadeReview = true;
      return;
    }

    if (
      this.order.reviews &&
      this.order.reviews.length > 0 &&
      this.order.reviews[0].madeBy === this.order.buyer['_id']
    ) {
      this.userMadeReview = true;
      return;
    }

    if (this.order.status !== OrderStatus.WAITING_REVIEW) return;

    const modal = await this.modalCtrl.create({
      component: NegotiationReviewComponent,
      componentProps: {
        order: this.order,
        otherUser: this.order.seller,
      },
    });

    await modal.present();

    const ret = await modal.onDidDismiss();

    if (ret && ret.data && ret.data.didReview) {
      this.alertService.showSuccess(
        'Avaliação publicada!',
        'Muito obrigado por publicar sua avaliação.',
        'Fechar',
      );
      this.start(this.order._id);
    }
  }

  async cancel() {
    if (
      !this.waiting_shipment &&
      !this.waiting_withdrawal &&
      !this.waiting_payment
    )
      return;

    if (this.waiting_payment) {
      this.alertService.showAlert(
        'Aguardando pagamento',
        'Aguarde até que o pagamento seja processado para cancelar a compra.',
      );
      return;
    }

    const res = await this.alertService.askQuestion(
      'Cancelar compra?',
      'Quer mesmo cancelar a compra?',
      'Quero cancelar',
      'Não',
    );
    if (!res) return;

    this.loading = true;

    try {
      this.loading = true;
      await this.ordersService.cancelPurchase(this.order._id);

      this.alertService.showAlert(
        'Compra cancelada',
        'Você receberá o estorno em até 1 dia útil.',
      );

      await this.start(this.order._id);
    } finally {
      this.loading = false;
    }
  }

  async return() {
    const res = await this.alertService.askQuestion(
      'Opa!',
      'Tem certeza de que quer devolver o pedido?',
    );
    if (!res) return;

    this.loading = true;

    try {
      this.ordersService.returnPurchase(this.order._id);
      this.alertService.showAlert(
        'Certo',
        'Te enviamos um email com as instruções para devolução',
      );
      this.start(this.order._id);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.paramsSub) this.paramsSub.unsubscribe();
  }

  async modalPix() {
    const exp = new Date(this.order.createdAt);
    exp.setMinutes(exp.getMinutes() + 10);
    const expiration = dayjs(exp).format('HH:mm');

    await Clipboard.write({ string: this.order.pix.payload });
    this.alertService.showSuccess(
      'Código Pix Copiado!',
      `Faça o pagamento até ${expiration}`,
    );
  }

  async copyPhone(text) {
    await Clipboard.write({ string: text });
    this.toastService.makeToast('Telefone copiado');
  }

  async copyMail(text) {
    await Clipboard.write({ string: text });
    this.toastService.makeToast('Email copiado');
  }
}
