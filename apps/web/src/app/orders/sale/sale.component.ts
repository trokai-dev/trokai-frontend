import {
  AllowedChatInStatuses,
  Order,
  OrderStatus,
  OrderStatusString,
} from '@trokai/shared-core';
import { Clothes } from '@trokai/shared-core';
import { ShippingServiceName, isTransportadora } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';
import { OrdersService } from '@trokai/shared-data-access';
import { AlertService, CostPipe } from '@trokai/shared-ui';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AddressOption } from '@trokai/shared-data-access';
import { Clipboard } from '@angular/cdk/clipboard';
import { BrowserRef } from 'src/app/services/browser-ref.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TkCartItemComponent } from '@trokai/shared-ui';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { LoadingService } from '@trokai/shared-ui';
import { TkSellerHeaderComponent } from '@trokai/shared-ui';
import { A11yModule } from '@angular/cdk/a11y';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss'],
  standalone: true,
  imports: [
    TkCartItemComponent,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
    CostPipe,
    RouterModule,
    TkSellerHeaderComponent,
    A11yModule,
    OrderDeliveryComponent,
  ],
})
export class SaleComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clipboard = inject(Clipboard);
  private browserRef = inject(BrowserRef);
  private loading = inject(LoadingService);

  order!: Order;
  url = '';

  buyerAvatar: string | null = null;
  expandedCost = false;

  isShipping = false;

  waiting_shipment = false;
  waiting_withdrawal = false;
  waiting_review = false;
  postageLabelExpired = false;

  postageInfoDate?: Date;
  postageInfoStatus?: string;
  showContact = false;

  shippingServiceString?: string;
  shippingAgencySelected?: string;

  transportadora = false;
  isMelhorEnvio = false;

  allowChat = false;

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('order_id');

    if (!orderId) {
      this.router.navigateByUrl('/orders/sales');
      return;
    }

    try {
      this.loading.start();
      await this.start(orderId);
    } finally {
      this.loading.finish();
    }
  }

  async start(orderId: string) {
    try {
      this.url = environment.imageURL;
      const res = await this.ordersService.fetchOrder(orderId);

      this.order = new Order(res);

      this.mountStatus();
      this.mountBuyer();

      if (this.isShipping && this.order.shippingValues) {
        this.transportadora = isTransportadora(
          this.order.shippingValues.service,
        );

        this.shippingAgencySelected =
          this.order.postageLabel?.melhorEnvioAgencyId;

        this.shippingServiceString = (
          ShippingServiceName as Record<string, string>
        )[this.order.shippingValues.service];
      }
    } catch {
      /* intentional */
    }
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

    this.showContact = AllowedChatInStatuses.includes(this.order.status);
  }

  // nao precisa
  mountBuyer() {
    const buyer = this.order.buyer;

    if (buyer.avatar && buyer.avatar != '') {
      this.buyerAvatar =
        environment.imageURL + buyer._id + '/avatar/' + buyer.avatar;
    } else {
      this.buyerAvatar = environment.defaultAvatar1;
    }
  }

  async getPostageLabel() {
    try {
      this.loading.start();

      // nao gerada, tem que gerar
      if (!this.order.postageLabel?.melhorEnvioId || this.postageLabelExpired) {
        // jadlog e loggi
        if (this.transportadora) {
          this.router.navigateByUrl(
            `/orders/sales/${this.order._id}/postage-options`,
          );
        } else {
          await this.generateCorreios();
        }
      } else if (this.order.postageLabel?.melhorEnvioUrl) {
        this.browserRef.window?.open(
          this.order.postageLabel.melhorEnvioUrl,
          '_blank',
        );
      }
    } finally {
      this.loading.finish();
    }
  }

  async openProduct(product: Clothes) {
    this.router.navigateByUrl(`/items/${product._id}`);
  }

  getOrderStatus() {
    return OrderStatusString[this.order.status];
  }

  async goToBank() {
    this.router.navigateByUrl('/account/bank');
  }

  async cancel() {
    const res = await this.alert.question(
      'Nossos atendentes irão te ajudar.',
      'Cancelar venda?',
      'Prosseguir',
      'Cancelar',
    );

    if (!res) return;

    if (this.browserRef && this.browserRef.window)
      this.browserRef.window?.open(
        'https://wa.me/5531971910095?text=Ol%C3%A1%2C+gostaria+de+cancelar+minha+venda+no+Troka%C3%AD.',
        '_blank',
      );
  }

  async copyPostage() {
    if (!this.order.postageLabel?.object) return;
    this.clipboard.copy(this.order.postageLabel.object);
    this.alert.alert('Código copiado');
  }

  async generateCorreios() {
    try {
      const res = await this.ordersService.confirmShippingAgency(
        this.order._id,
        null,
      );

      if (res.melhorEnvioUrl && res.melhorEnvioUrl != '')
        this.browserRef.window?.open(res.melhorEnvioUrl, '_blank');

      await this.start(this.order._id);
    } catch {
      /* intentional */
    }
  }

  openChat() {
    this.router.navigate(['chat'], { relativeTo: this.route });
  }
}
