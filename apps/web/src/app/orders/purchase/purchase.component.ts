import { Clothes, GlobalParams, Order, OrderStatus } from '@trokai/shared-core';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AlertService } from '@trokai/shared-ui';
import { GlobalService } from 'src/app/services/global.service';
import { OrdersService } from '@trokai/shared-data-access';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { RatingFormComponent } from '../rating-modal/rating-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrderDeliveryComponent } from '../order-delivery/order-delivery.component';
import { TkPurchaseDetailComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    OrderDeliveryComponent,
    TkPurchaseDetailComponent,
  ],
})
export class PurchaseComponent implements OnInit, OnDestroy {
  private ordersService = inject(OrdersService);
  private globalService = inject(GlobalService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clipboard = inject(Clipboard);
  private dialog = inject(MatDialog);

  order!: Order;
  loading = true;
  globalParams: GlobalParams | null = null;
  paramsSub!: Subscription;

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('order_id');
    if (!orderId) return;

    await this.start(orderId);

    this.paramsSub = this.globalService.params$.subscribe((params) => {
      this.globalParams = params;
    });
  }

  async start(orderId: string) {
    try {
      const res = await this.ordersService.fetchOrder(orderId);
      this.order = new Order(res);
      this.loading = false;
      this.checkReview();
    } catch {
      /* intentional */
    }
  }

  reload() {
    this.start(this.order._id);
  }

  openProduct(product: Clothes) {
    this.router.navigateByUrl(
      `/users/${this.order.seller.seller?.nickname}/${product._id}`,
    );
  }

  openSeller() {
    this.router.navigateByUrl(`/users/${this.order.seller.seller?.nickname}`);
  }

  openChat() {
    this.router.navigate(['chat'], { relativeTo: this.route });
  }

  copyPix() {
    if (!this.order.pix) return;
    this.clipboard.copy(this.order.pix.payload);
    this.alert.alert('Código PIX copiado!');
  }

  async checkReview() {
    if (
      this.order?.reviews?.find((el) => el.madeBy === this.order.buyer._id)
    )
      return;

    if (this.order.status !== OrderStatus.WAITING_REVIEW) return;

    const dialog = this.dialog.open(RatingFormComponent, {
      data: { order: this.order, otherUser: this.order.seller },
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

  ngOnDestroy(): void {
    if (this.paramsSub) this.paramsSub.unsubscribe();
  }
}
