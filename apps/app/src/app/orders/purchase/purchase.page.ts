import { Clothes, GlobalParams, Order, OrderStatus } from '@trokai/shared-core';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemViewerComponent } from 'src/app/shared/components/item-viewer/item-viewer.component';
import { OrdersService } from '@trokai/shared-data-access';
import { Clipboard } from '@capacitor/clipboard';
import { NegotiationReviewComponent } from 'src/app/shared/components/negotiation-review/negotiation-review.component';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import {
  ModalController,
  NavController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonSpinner,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { ChatComponent } from 'src/app/chat/chat.component';
import { AlertService } from '@trokai/shared-ui';
import { ToastService } from 'src/app/services/toast-service';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';
import { TkPurchaseDetailComponent } from '@trokai/shared-features';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonFooter,
    MatButtonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    BackButtonComponent,
    OrderDeliveryComponent,
    TkPurchaseDetailComponent,
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

  order!: Order;
  loading = true;
  globalParams: GlobalParams | null = null;
  paramsSub!: Subscription;

  waiting_review = false;
  waiting_withdrawal = false;
  userMadeReview = false;

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('order_id');
    if (!orderId) return;

    await this.start(orderId);

    if (this.route.snapshot.paramMap.get('open_chat')) this.chat();

    this.paramsSub = this.globalService.params$().subscribe((params) => {
      this.globalParams = params;
    });
  }

  async start(orderId: string) {
    try {
      const res = await this.ordersService.fetchOrder(orderId);
      this.order = new Order(res);
      this.mountFooterState();
      this.loading = false;
      this.checkReview();
    } catch {
      /* intentional */
    }
  }

  private mountFooterState() {
    this.waiting_review = this.order.status === OrderStatus.WAITING_REVIEW;
    this.waiting_withdrawal =
      this.order.status === OrderStatus.WAITING_WITHDRAWAL;
    this.userMadeReview =
      (this.order.reviews?.length === 2 ||
        (this.order.reviews?.length > 0 &&
          this.order.reviews[0].madeBy === this.order.buyer['_id'])) ??
      false;
  }

  reload() {
    this.start(this.order._id);
  }

  async chat() {
    const modal = await this.modalCtrl.create({
      component: ChatComponent,
      componentProps: {
        otherUser: this.order.seller,
        negotiationType: 'sale',
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

  openOtherUser() {
    this.navCtrl.navigateForward(
      `/main/negotiations/wardrobe/${
        this.order.seller['_id']
      }/${new Date().getTime()}`,
    );
  }

  async copyPix() {
    if (!this.order.pix) return;
    await Clipboard.write({ string: this.order.pix.payload });
    this.alertService.showSuccess(
      'Código Pix Copiado!',
      'Faça o pagamento antes do vencimento.',
    );
  }

  async confirmWithdrawal() {
    const res = await this.alertService.askQuestion(
      'Já se encontrou?',
      'Apenas confirme quando estiver com os produtos em mãos.',
    );
    if (!res) return;
    try {
      await this.ordersService.confirmLocalWithdrawal(this.order._id);
      this.reload();
    } catch {
      /* intentional */
    }
  }

  async checkReview() {
    if (this.userMadeReview) return;
    if (this.order.status !== OrderStatus.WAITING_REVIEW) return;

    const modal = await this.modalCtrl.create({
      component: NegotiationReviewComponent,
      componentProps: { order: this.order, otherUser: this.order.seller },
    });
    await modal.present();

    const ret = await modal.onDidDismiss();
    if (ret?.data?.didReview) {
      this.alertService.showSuccess(
        'Avaliação publicada!',
        'Muito obrigado por publicar sua avaliação.',
        'Fechar',
      );
      this.reload();
    }
  }

  ngOnDestroy(): void {
    if (this.paramsSub) this.paramsSub.unsubscribe();
  }
}
