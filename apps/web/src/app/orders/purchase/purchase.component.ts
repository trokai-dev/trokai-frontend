import { Clothes, GlobalParams } from '@trokai/shared-core';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AlertService, CostPipe } from '@trokai/shared-ui';
import { GlobalService } from 'src/app/services/global.service';
import { OrdersService } from '@trokai/shared-data-access';
import { AddressOption, PaymentOption } from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';
import { BrowserRef } from 'src/app/services/browser-ref.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { RatingFormComponent } from '../rating-modal/rating-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { CartItemComponent } from '../../modules/cart-item/cart-item.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import dayjs from 'dayjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from 'src/app/services/dialog.service';
import {
  AllowedChatInStatuses,
  Order,
  OrderStatus,
  OrderStatusString,
} from '@trokai/shared-core';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';
import { TkSellerHeaderComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    CartItemComponent,
    MatRippleModule,
    RouterLink,
    MatTooltipModule,
    CurrencyPipe,
    DatePipe,
    CostPipe,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    OrderDeliveryComponent,
    TkSellerHeaderComponent,
  ],
})
export class PurchaseComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private globalService = inject(GlobalService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private browserRef = inject(BrowserRef);
  private clipboard = inject(Clipboard);
  private dialog = inject(MatDialog);
  private dialogService = inject(DialogService);

  order!: Order;
  loading = true;
  url = '';

  sellerAvatar: string | null = null;
  expandedCost = false;

  sellerFinalPercentageApplied = 0;
  finalDeclaredValue = 0;

  isShipping = false;

  loadingPostageLabel = false;

  waiting_shipment = false;
  waiting_withdrawal = false;
  waiting_review = false;
  waiting_payment = false;

  order_delivered = false;
  userMadeReview = false;
  userMayReturn = false;

  paramsSub!: Subscription;
  globalParams: GlobalParams | null = null;

  postageInfoStatus?: string;
  postageInfoDate?: Date;

  showContact = false;

  payment_pix = false;
  pixQR: string | null = null;
  pixExpiration: string | null = null;

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('order_id');
    if (!orderId) return;

    await this.start(orderId);

    this.paramsSub = this.globalService.params.subscribe((params) => {
      this.globalParams = params;
      this.mountReturn();
    });
  }

  async start(orderId: string) {
    try {
      this.url = environment.imageURL;
      const res = await this.ordersService.fetchOrder(orderId);

      this.order = new Order(res);

      this.mountStatus();
      this.mountSeller();
      this.checkReview();
      this.mountReturn();
      this.mountDiscount();
      this.checkPix();

      this.loading = false;
    } catch {
      /* intentional */
    }
  }

  mountDiscount() {
    if (!this.order.businessValues) return;

    let _discount = 0;

    if (this.order.businessValues.couponDiscount)
      _discount += this.order.businessValues.couponDiscount;

    if (this.order.businessValues.pixDiscount)
      _discount += this.order.businessValues.pixDiscount;
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

    this.showContact = AllowedChatInStatuses.includes(this.order.status);
  }

  openOtherUser() {
    this.router.navigateByUrl(`/users/${this.order.seller.seller?.nickname}`);
  }

  openChat() {
    this.router.navigate(['chat'], { relativeTo: this.route });
  }

  mountSeller() {
    const seller = this.order.seller;

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
    } catch (_err) {
      // console.log(err);
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
    return null;
  }

  async copyPostage() {
    if (!this.order.postageLabel?.object) return;
    this.clipboard.copy(this.order.postageLabel.object);
    this.alert.alert('Código copiado');
  }

  async chat($vent: Event) {
    $vent.stopPropagation();
    this.dialogService.openDownloadModal();
  }

  async openProduct(product: Clothes) {
    this.router.navigateByUrl(
      `/users/${this.order.seller.seller?.nickname}/${product._id}`,
    );
  }

  async confirmWithdrawal() {
    const res = await this.alert.question(
      'Apenas confirme se estiver com os produtos em mãos.',
      'Atenção',
      'Confirmar',
      'Cancelar',
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
    if (this.order?.reviews?.find((el) => el.madeBy === this.order.buyer._id)) {
      this.userMadeReview = true;
      return;
    }

    if (this.order.status !== OrderStatus.WAITING_REVIEW) return;

    const dialog = await this.dialog.open(RatingFormComponent, {
      data: {
        order: this.order,
        otherUser: this.order.seller,
      },
      panelClass: ['dialog-normal', 'overflow-y'],
    });

    const ret = await firstValueFrom(dialog.afterClosed());

    if (ret && ret.didReview) {
      this.alert.showDialog(
        'Avaliação publicada!',
        'Muito obrigado por publicar sua avaliação.',
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
      this.alert.showDialog(
        'Aguardando pagamento',
        'Aguarde até que o pagamento seja processado para cancelar a compra.',
      );
      return;
    }

    const res = await this.alert.question(
      'Quer mesmo cancelar a compra?',
      'Cancelar a compra',
      'Quero cancelar!',
      'Não',
    );

    if (!res) return;

    try {
      this.loading = true;
      await this.ordersService.cancelPurchase(this.order._id);

      this.alert.showDialog(
        'Compra cancelada',
        'Você receberá o estorno em até 1 dia útil.',
      );

      await this.start(this.order._id);
    } finally {
      this.loading = false;
    }
  }

  checkPix() {
    if (this.order.payment.paymentMethod !== PaymentOption.PIX) return;
    if (!this.order.pix) return;
    this.pixExpiration = dayjs(this.order.pix.expirationDate).format('HH:mm');
    this.pixQR = this.order.pix.encodedImage;
  }

  copyPix(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this.order.pix) return;
    this.clipboard.copy(this.order.pix.payload);
    this.alert.alert('Código PIX copiado!');
  }

  // garante que ta copiando tudo (se for ctrl+c)
  onInputCopy($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.copyPix();
  }

  async return() {
    const res = await this.alert.question(
      'Tem certeza de que quer devolver o pedido?',
      'Opa!',
    );

    if (!res) return;

    this.loading = true;

    try {
      await this.ordersService.returnPurchase(this.order._id);
      this.alert.showDialog(
        'Atenção',
        'Te enviamos um email com as instruções para devolução',
      );
      await this.start(this.order._id);
    } finally {
      this.loading = false;
    }
  }
}
