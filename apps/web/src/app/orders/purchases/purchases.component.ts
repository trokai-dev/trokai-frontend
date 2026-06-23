import { CostPipe } from '@trokai/shared-ui';
import { OrderDisplay, OrderListItem } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { OrdersService } from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TkCartItemComponent } from '@trokai/shared-ui';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    TkCartItemComponent,
    MatButtonModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    CostPipe,
  ],
})
export class PurchasesComponent implements OnInit {
  private ordersService = inject(OrdersService);

  purchases: OrderDisplay[] = [];

  ngOnInit() {
    this.load();
  }

  async load() {
    try {
      const purchases = await this.ordersService.fetchPurchases();
      this.mountPurchases(purchases);
    } finally {
      /* intentional */
    }
  }

  mountPurchases(purchases: OrderListItem[]) {
    const displays: OrderDisplay[] = [];

    purchases.forEach((s) => {
      const display = new OrderDisplay();
      display._id = s._id;
      display.status = this.ordersService.getOrderStatus(s.status);
      display.createdAt = s.createdAt;
      display.clothes = s.clothes;
      display.buyerCost = s.businessValues.buyerCost;
      display.customId = s.customId;

      displays.push(display);
    });

    displays.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    this.purchases = displays;
  }

  getOrderImages(order: OrderListItem) {
    const images = [];
    let products = [];

    products = order.clothes;
    images.push(
      products[0].images?.[0]?.sm ??
        `${environment.imageURL + order.seller}/${products[0].smallPicture?.url}`,
    );

    if (products[1])
      images.push(
        products[1].images?.[0]?.sm ??
          `${environment.imageURL + order.seller}/${products[1].smallPicture?.url}`,
      );

    return images;
  }
}
