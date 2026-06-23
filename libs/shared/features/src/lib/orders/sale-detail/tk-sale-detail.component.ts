import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  AllowedChatInStatuses,
  Clothes,
  Order,
  OrderStatus,
  OrderStatusString,
} from '@trokai/shared-core';
import { AddressOption } from '@trokai/shared-data-access';
import {
  CostPipe,
  TkCartItemComponent,
  TkSellerHeaderComponent,
} from '@trokai/shared-ui';

/**
 * Shared sale-detail CONTENT (canonical web). Presentational: the platform shell
 * fetches the order, projects its own `<... delivery>` via ng-content, and wires
 * the outputs to platform nav/modals (open product, chat, bank, cancel).
 */
@Component({
  selector: 'tk-sale-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    CostPipe,
    MatButtonModule,
    TkCartItemComponent,
    TkSellerHeaderComponent,
  ],
  templateUrl: './tk-sale-detail.component.html',
  styleUrl: './tk-sale-detail.component.scss',
})
export class TkSaleDetailComponent implements OnChanges {
  @Input({ required: true }) order!: Order;

  @Output() openProduct = new EventEmitter<Clothes>();
  @Output() openChat = new EventEmitter<void>();
  @Output() goToBank = new EventEmitter<void>();
  @Output() cancelOrder = new EventEmitter<void>();

  isShipping = false;
  waiting_shipment = false;
  waiting_withdrawal = false;
  showContact = false;

  ngOnChanges(): void {
    if (!this.order) return;
    const s = this.order.status;
    this.isShipping = this.order.shippingType === AddressOption.SHIPPING;
    this.waiting_shipment = s === OrderStatus.WAITING_SHIPMENT;
    this.waiting_withdrawal = s === OrderStatus.WAITING_WITHDRAWAL;
    this.showContact = AllowedChatInStatuses.includes(s);
  }

  getOrderStatus() {
    return OrderStatusString[this.order.status];
  }
}
