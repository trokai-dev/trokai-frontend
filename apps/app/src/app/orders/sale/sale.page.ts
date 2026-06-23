import { Clothes, Order } from '@trokai/shared-core';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '@trokai/shared-data-access';
import { ItemViewerComponent } from 'src/app/shared/components/item-viewer/item-viewer.component';
import { CancelSaleComponent } from '../cancel-sale/cancel-sale.component';
import { Browser } from '@capacitor/browser';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import {
  ModalController,
  NavController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from 'src/app/chat/chat.component';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';
import { TkSaleDetailComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.page.html',
  styleUrls: ['./sale.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    BackButtonComponent,
    OrderDeliveryComponent,
    TkSaleDetailComponent,
  ],
})
export class SalePage implements OnInit, OnDestroy {
  private ordersService = inject(OrdersService);
  private modalCtrl = inject(ModalController);
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);

  order!: Order;
  loading = true;

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('order_id');
    if (!orderId) return;

    await this.start(orderId);

    if (this.route.snapshot.paramMap.get('open_chat')) this.chat();

    Browser.addListener('browserFinished', () => this.start(orderId));
  }

  async start(orderId: string) {
    try {
      const res = await this.ordersService.fetchOrder(orderId);
      this.order = new Order(res);
      this.loading = false;
    } catch {
      /* intentional */
    }
  }

  async chat() {
    const modal = await this.modalCtrl.create({
      component: ChatComponent,
      componentProps: {
        otherUser: this.order.buyer,
        negotiationType: 'purchase',
        negotiationId: this.order._id,
        enabled: true,
      },
    });
    modal.present();
  }

  async openProduct(product: Clothes) {
    const modal = await this.modalCtrl.create({
      component: ItemViewerComponent,
      cssClass: 'modal-85',
      componentProps: {
        product,
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

  goToBank() {
    this.navCtrl.navigateForward('/main/profile/options/bank');
  }

  async cancel() {
    const modal = await this.modalCtrl.create({
      component: CancelSaleComponent,
      componentProps: { order: this.order },
      cssClass: 'modal-85',
    });
    modal.present();
  }

  async ngOnDestroy() {
    await Browser.removeAllListeners();
  }
}
