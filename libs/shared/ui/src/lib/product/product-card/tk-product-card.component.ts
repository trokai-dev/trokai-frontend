import { Clothes, ClothesStatus, NavigationManager } from '@trokai/shared-core';
import { ProductService } from '@trokai/shared-data-access';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CurrencyPipe,
  NgClass,
  NgOptimizedImage,
  NgStyle,
} from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CostPipe } from '../../pipes/cost.pipe';
import { HideLoadingImageDirective } from '../../directives/hide-loading-image.directive';
import {
  StatusPillComponent,
  StatusPillVariant,
} from '../../status-pill/status-pill.component';
import { TkLikeButtonComponent } from '../like-button/tk-like-button.component';

@Component({
  selector: 'tk-product-card',
  templateUrl: './tk-product-card.component.html',
  styleUrls: ['./tk-product-card.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    RouterLink,
    NgOptimizedImage,
    CurrencyPipe,
    CostPipe,
    HideLoadingImageDirective,
    MatTooltipModule,
    TkLikeButtonComponent,
    StatusPillComponent,
  ],
})
export class TkProductCardComponent implements OnInit {
  @Input() product!: Clothes;
  @Input() clean = true;
  @Input() canFavorite = true;
  /** Web: navigate via the rendered `<a routerLink>` (SSR/SEO). App: false → emit `(open)`. */
  @Input() useLink = true;
  /** Marks the image as the LCP candidate (above-the-fold). */
  @Input() priority = false;
  @Input() extraImgClass = '';

  @Output() open = new EventEmitter<Clothes>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFinishLiking = new EventEmitter<void>();

  private productService = inject(ProductService);
  private nav = inject(NavigationManager);

  productLink = '';
  sizeString: string | null = null;
  myProduct = false;

  waitingAdjustment = false;
  waitingPublication = false;
  expired = false;
  sold = false;
  reserved = false;
  negotiatingSell = false;
  paused = false;

  statusText: string | null = null;

  ngOnInit(): void {
    this.productLink = this.productService.mountProductLink(this.product);

    this.sizeString = this.productService.getSizeName(
      this.product.size,
      this.product.category,
      this.product.age,
    );

    const s = this.product.status;
    this.waitingAdjustment = s === ClothesStatus.WAITING_ADJUSTMENT;
    this.waitingPublication = s === ClothesStatus.WAITING_PUBLICATION;
    this.expired = s === ClothesStatus.EXPIRED;
    this.sold = s === ClothesStatus.SOLD;
    this.reserved = s === ClothesStatus.RESERVED;
    this.negotiatingSell = s === ClothesStatus.NEGOTIATING_SELL;
    this.paused = s === ClothesStatus.PAUSED_BY_USER;

    this.myProduct = this.product.owner === this.nav.currentUserId();
    this.statusText = this.getStatusText();
  }

  get thumbUrl(): string {
    return this.product.images?.[0]?.sm ?? '';
  }

  onClick() {
    this.open.emit(this.product);
  }

  /** Maps the product status to a shared status-pill variant (token-driven color). */
  get statusVariant(): StatusPillVariant {
    if (this.sold) return 'success';
    if (this.reserved || this.negotiatingSell) return 'muted';
    if (this.myProduct && this.waitingAdjustment) return 'warning';
    if (this.myProduct && this.expired) return 'danger';
    if (this.myProduct && this.paused) return 'muted';
    return 'neutral';
  }

  private getStatusText() {
    if (this.waitingAdjustment) return 'Requer ajustes';
    if (this.waitingPublication) return 'Em análise';
    if (this.expired) return 'Expirado';
    if (this.sold) return 'Vendido';
    if (this.reserved) return 'Reservado';
    if (this.negotiatingSell) return 'Reservado';
    if (this.paused) return 'Pausado';
    return null;
  }
}
