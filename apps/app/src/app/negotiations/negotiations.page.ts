import { OrderDisplay, OrderListItem } from '@trokai/shared-core';
import {
  TkPurchaseListItemComponent,
  TkSaleListItemComponent,
} from '@trokai/shared-features';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';
import { OrdersService } from '@trokai/shared-data-access';

import { NgClass } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sadOutline } from 'ionicons/icons';

@Component({
  selector: 'app-negotiations',
  templateUrl: './negotiations.page.html',
  styleUrls: ['./negotiations.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    NgClass,
    TkPurchaseListItemComponent,
    TkSaleListItemComponent,
  ],
})
export class NegotiationsPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  tabList = ['Compras', 'Vendas'];
  tab = 'Compras';

  isLoading = true;

  sales: OrderDisplay[] = [];
  purchases: OrderDisplay[] = [];

  user;

  private mainService = inject(MainService);
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    addIcons({ sadOutline });
    this.user = this.authService.getUserValue();

    this.mainService.negotiationsTab.subscribe(() => {
      this.content.scrollToTop(400); // rola a pagina ao escolher um item
    });
  }

  ionViewWillEnter() {
    const urlIndex = this.route.snapshot.paramMap.get('tab');

    if (urlIndex != null) this.tab = this.tabList[urlIndex];

    this.changeTab(this.tab);
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
      display.images = this.getOrderImages(s);
      display.sellerProfit = s.businessValues.sellerSplitBeforeAnticipation;
      displays.push(display);
    });

    displays.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    this.sales = displays;
  }

  mountPurchases(purchases: OrderListItem[]) {
    const displays: OrderDisplay[] = [];

    purchases.forEach((s) => {
      const display = new OrderDisplay();

      display._id = s._id;
      display.status = this.ordersService.getOrderStatus(s.status);
      display.createdAt = s.createdAt;
      display.clothes = s.clothes;
      display.images = this.getOrderImages(s);
      display.buyerCost = s.businessValues.buyerCost;

      displays.push(display);
    });

    displays.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    this.purchases = displays;

    console.log(this.purchases);
  }

  getOrderImages(order: OrderListItem) {
    const images = [];
    let products = [];

    products = order.clothes;

    if (products[0]?.images?.[0]?.sm) images.push(products[0].images[0].sm);

    if (products[1]?.images?.[0]?.sm) images.push(products[1].images[0].sm);

    return images;
  }

  async changeTab(tab: string) {
    this.tab = tab;
    this.isLoading = true;

    if (tab === 'Compras')
      this.mountPurchases(await this.ordersService.fetchPurchases());

    if (tab === 'Vendas')
      this.mountSales(await this.ordersService.fetchSales());

    this.isLoading = false;
  }

  openPurchase(purchase) {
    this.router.navigateByUrl('/main/negotiations/purchase/' + purchase._id);
  }

  openSale(sale) {
    this.router.navigateByUrl('/main/negotiations/sale/' + sale._id);
  }

  async doRefresh(event) {
    try {
      this.changeTab(this.tab);
    } finally {
      event.target.complete();
    }
  }
}
