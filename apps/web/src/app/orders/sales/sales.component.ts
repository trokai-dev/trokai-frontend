import { OrderDisplay, OrderListItem } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { OrdersService } from '@trokai/shared-data-access';
import { TkSaleListItemComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [TkSaleListItemComponent],
})
export class SalesComponent implements OnInit {
  private ordersService = inject(OrdersService);

  sales: OrderDisplay[] = [];

  ngOnInit() {
    this.load();
  }

  async load() {
    try {
      const sales = await this.ordersService.fetchSales();
      this.mountSales(sales);
    } finally {
      /* intentional */
    }
  }

  mountSales(sales: OrderListItem[]) {
    const displays: OrderDisplay[] = [];

    sales.forEach((s) => {
      const display = new OrderDisplay();

      display._id = s._id;
      display.status = this.ordersService.getOrderStatus(s.status);
      display.updatedAt = s.updatedAt;
      display.createdAt = s.createdAt;
      display.clothes = s.clothes;
      display.sellerProfit = s.businessValues.sellerSplitBeforeAnticipation;
      display.customId = s.customId;
      displays.push(display);
    });

    displays.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    this.sales = displays;
  }
}
