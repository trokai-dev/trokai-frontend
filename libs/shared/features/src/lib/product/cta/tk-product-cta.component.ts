import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Clothes, User } from '@trokai/shared-core';
import {
  Basket,
  BuyingService,
  ClothesPayment,
} from '@trokai/shared-data-access';
import { CostPipe, TkZipcodeShippingFeeComponent } from '@trokai/shared-ui';
import { TkReserveTimeComponent } from '../../buying/reserve-time/tk-reserve-time.component';
import { TkCartAddedDialogComponent } from '../../buying/cart-added-dialog/tk-cart-added-dialog.component';

/**
 * Product buy CTA (canonical web): price/installments/delivery, reserve-time
 * countdown, buy/in-basket buttons, protection hints. Owns basket state via
 * `BuyingService.baskets$` so neither shell has to duplicate processBaskets().
 * `useLink` follows the `TkProductCardComponent` split: web renders the "ver
 * na sacola" routerLink, app passes `useLink=false` and handles `goToCart`.
 */
@Component({
  selector: 'tk-product-cta',
  standalone: true,
  imports: [
    CurrencyPipe,
    CostPipe,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    TkZipcodeShippingFeeComponent,
    TkReserveTimeComponent,
  ],
  templateUrl: './tk-product-cta.component.html',
  styleUrl: './tk-product-cta.component.scss',
})
export class TkProductCtaComponent implements OnInit, OnChanges, OnDestroy {
  private buyingService = inject(BuyingService);
  private matDialog = inject(MatDialog);

  @Input({ required: true }) product!: Clothes;
  @Input() payment?: ClothesPayment;
  @Input({ required: true }) owner!: User;
  @Input() myProduct = false;
  @Input() productId: string | undefined;
  @Input() isInReserves: boolean | null = null;
  @Input() useLink = true;

  @Output() buy = new EventEmitter<void>();
  @Output() openCheckout = new EventEmitter<void>();
  @Output() goToCart = new EventEmitter<void>();
  @Output() addMore = new EventEmitter<User>();

  productInBasket = false;
  wardrobeBasket = false;
  wardrobeReserved = false;

  private baskets: Basket[] = [];
  private basketsSub!: Subscription;

  get showCta(): boolean {
    return (
      !!this.product?.sell &&
      (this.product.published || this.product.reserved || this.myProduct)
    );
  }

  ngOnInit() {
    this.basketsSub = this.buyingService.baskets$.subscribe((baskets) => {
      this.baskets = baskets;
      this.processBaskets();
    });
  }

  ngOnChanges() {
    this.processBaskets();
  }

  private processBaskets() {
    const basket =
      this.baskets && this.owner
        ? this.baskets.find((b) => b.owner._id === this.owner._id)
        : undefined;

    if (!basket) {
      this.productInBasket = false;
      this.wardrobeBasket = false;
      this.wardrobeReserved = false;
      return;
    }

    this.wardrobeBasket = true;
    this.productInBasket = basket.products.some(
      (p) => p._id === this.product?._id,
    );
    this.wardrobeReserved = basket.reserved;
  }

  clickBuy() {
    if (!this.product) return;
    this.buyingService.addProduct(this.owner, this.product);
    this.buy.emit();

    const basket = this.buyingService.getBasketFromOwner(this.owner._id);
    if (!basket) return;

    this.matDialog
      .open(TkCartAddedDialogComponent, {
        data: { basket },
        panelClass: 'dialog-normal',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.addMore) this.addMore.emit(this.owner);
      });
  }

  removeFromBasket() {
    if (!this.product) return;
    this.buyingService.removeProduct(this.product);
  }

  ngOnDestroy() {
    this.basketsSub?.unsubscribe();
  }
}
