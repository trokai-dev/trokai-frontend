import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import dayjs from 'dayjs';
import {
  AllowedChatInStatuses,
  Clothes,
  GlobalParams,
  Order,
  OrderStatus,
  OrderStatusString,
} from '@trokai/shared-core';
import {
  AddressOption,
  OrdersService,
  PaymentOption,
} from '@trokai/shared-data-access';
import {
  AlertService,
  CostPipe,
  TkCartItemComponent,
  TkSellerHeaderComponent,
} from '@trokai/shared-ui';

/**
 * Shared purchase-detail CONTENT (canonical web). The platform shell fetches the
 * order, projects its own `<... delivery>` (order-delivery) via ng-content, and
 * wires the outputs to platform nav/modals/clipboard. Business actions
 * (cancel/return) use the shared OrdersService + AlertService and emit `reload`.
 */
@Component({
  selector: 'tk-purchase-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    CostPipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    TkCartItemComponent,
    TkSellerHeaderComponent,
  ],
  templateUrl: './tk-purchase-detail.component.html',
  styleUrl: './tk-purchase-detail.component.scss',
})
export class TkPurchaseDetailComponent implements OnChanges {
  private ordersService = inject(OrdersService);
  private alert = inject(AlertService);

  @Input({ required: true }) order!: Order;
  @Input() globalParams: GlobalParams | null = null;

  /** A product row was tapped (shell: navigate / open viewer modal). */
  @Output() openProduct = new EventEmitter<Clothes>();
  /** Seller header tapped (shell: open seller store). */
  @Output() openSeller = new EventEmitter<void>();
  /** Chat button tapped (shell: open chat route / modal / download modal). */
  @Output() openChat = new EventEmitter<void>();
  /** PIX copy requested (shell: copy `order.pix.payload` + feedback). */
  @Output() copyPix = new EventEmitter<void>();
  /** An action mutated the order — shell should refetch and re-pass `order`. */
  @Output() reload = new EventEmitter<void>();

  isShipping = false;
  waiting_shipment = false;
  waiting_withdrawal = false;
  waiting_review = false;
  waiting_payment = false;
  order_delivered = false;
  payment_pix = false;
  showContact = false;
  userMayReturn = false;

  pixQR: string | null = null;
  pixExpiration: string | null = null;

  ngOnChanges(): void {
    if (!this.order) return;
    this.mountStatus();
    this.checkPix();
    this.mountReturn();
  }

  private mountStatus() {
    const s = this.order.status;
    this.isShipping = this.order.shippingType === AddressOption.SHIPPING;
    this.waiting_shipment = s === OrderStatus.WAITING_SHIPMENT;
    this.waiting_withdrawal = s === OrderStatus.WAITING_WITHDRAWAL;
    this.waiting_payment = s === OrderStatus.WAITING_PAYMENT;
    this.waiting_review = s === OrderStatus.WAITING_REVIEW;
    this.order_delivered = s === OrderStatus.ORDER_DELIVERED;
    this.payment_pix = this.order.payment.paymentMethod === PaymentOption.PIX;
    this.showContact = AllowedChatInStatuses.includes(s);
  }

  private mountReturn() {
    if (!this.globalParams || !this.order || !this.order_delivered) return;
    try {
      const returningLimit = new Date(
        new Date().setDate(
          new Date(this.order.createdAt).getDate() +
            this.globalParams.daysToReturnOrder,
        ),
      );
      const diffDays =
        (returningLimit.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24);
      this.userMayReturn = diffDays >= 0;
    } catch {
      /* intentional */
    }
  }

  private checkPix() {
    if (this.order.payment.paymentMethod !== PaymentOption.PIX) return;
    if (!this.order.pix) return;
    this.pixExpiration = dayjs(this.order.pix.expirationDate).format('HH:mm');
    this.pixQR = this.order.pix.encodedImage;
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

  /** Public so the shell's "Já recebi" footer / projected delivery can call it. */
  async confirmWithdrawal() {
    const res = await this.alert.askQuestion(
      'Já se encontrou?',
      'Apenas confirme quando estiver com os produtos em mãos.',
    );
    if (!res) return;
    try {
      await this.ordersService.confirmLocalWithdrawal(this.order._id);
      this.reload.emit();
    } catch {
      /* intentional */
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
      this.alert.showAlert(
        'Aguardando pagamento',
        'Aguarde até que o pagamento seja processado para cancelar a compra.',
      );
      return;
    }

    const res = await this.alert.askQuestion(
      'Cancelar a compra',
      'Quer mesmo cancelar a compra?',
      'Quero cancelar!',
      'Não',
    );
    if (!res) return;

    try {
      await this.ordersService.cancelPurchase(this.order._id);
      this.alert.showAlert(
        'Compra cancelada',
        'Você receberá o estorno em até 1 dia útil.',
      );
      this.reload.emit();
    } catch {
      /* intentional */
    }
  }

  async return() {
    const res = await this.alert.askQuestion(
      'Opa!',
      'Tem certeza de que quer devolver o pedido?',
    );
    if (!res) return;
    try {
      await this.ordersService.returnPurchase(this.order._id);
      this.alert.showAlert(
        'Atenção',
        'Te enviamos um email com as instruções para devolução',
      );
      this.reload.emit();
    } catch {
      /* intentional */
    }
  }
}
