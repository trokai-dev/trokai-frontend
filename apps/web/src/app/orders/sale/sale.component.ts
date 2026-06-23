import { Clothes, Order } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';
import { OrdersService } from '@trokai/shared-data-access';
import { AlertService, LoadingService } from '@trokai/shared-ui';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrowserRef } from 'src/app/services/browser-ref.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';
import { TkSaleDetailComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    OrderDeliveryComponent,
    TkSaleDetailComponent,
  ],
})
export class SaleComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private browserRef = inject(BrowserRef);
  private loading = inject(LoadingService);

  order!: Order;

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
      const res = await this.ordersService.fetchOrder(orderId);
      this.order = new Order(res);
    } catch {
      /* intentional */
    }
  }

  openProduct(product: Clothes) {
    this.router.navigateByUrl(`/items/${product._id}`);
  }

  openChat() {
    this.router.navigate(['chat'], { relativeTo: this.route });
  }

  goToBank() {
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

    this.browserRef.window?.open(
      'https://wa.me/5531971910095?text=Ol%C3%A1%2C+gostaria+de+cancelar+minha+venda+no+Troka%C3%AD.',
      '_blank',
    );
  }
}
