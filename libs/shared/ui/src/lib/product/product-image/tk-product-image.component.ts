import { Clothes } from '@trokai/shared-core';
import {
  Component,
  Input,
  NgZone,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser, NgClass, NgOptimizedImage, NgStyle } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import { TkLikeButtonComponent } from '../like-button/tk-like-button.component';
import { TkGalleryComponent } from '../gallery/tk-gallery.component';
import { StatusPillComponent } from '../../status-pill/status-pill.component';
import type { StatusPillVariant } from '../../status-pill/status-pill.component';
import { HideLoadingImageDirective } from '../../directives/hide-loading-image.directive';

/**
 * Product image gallery (desktop thumb rail + mobile swiper). Web-oriented —
 * the app renders product images inline in its Ionic page — but lives in
 * shared-ui so it composes the already-shared `tk-like-button`/`tk-gallery`/
 * `tk-status-pill`. Opens the full-screen `tk-gallery` via `MatDialog`.
 */
@Component({
  selector: 'tk-product-image',
  standalone: true,
  imports: [
    NgClass,
    NgOptimizedImage,
    NgStyle,
    HideLoadingImageDirective,
    TkLikeButtonComponent,
    StatusPillComponent,
  ],
  templateUrl: './tk-product-image.component.html',
  styleUrl: './tk-product-image.component.scss',
})
export class TkProductImageComponent implements OnInit {
  @Input() product!: Clothes;
  @Input() myProduct = false;

  activeImage = 0;
  swiperRef?: Swiper;

  private matDialog = inject(MatDialog);
  private ngZone = inject(NgZone);
  private platformId = inject<object>(PLATFORM_ID);

  ngOnInit() {
    if (!this.product) throw new Error('Product or clothes data is missing');

    if (isPlatformBrowser(this.platformId)) {
      // Initialize Swiper only in the browser
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.swiperRef = new Swiper('.product-image-swiper', {
            modules: [Pagination],
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
          });
        }, 0);
      });
    }
  }

  get statusVariant(): StatusPillVariant {
    const p = this.product;
    if (p.sold) return 'success';
    if (p.reserved || p.selling || p.unavailable) return 'muted';
    if (this.myProduct && p.waitingAdjustment) return 'warning';
    if (this.myProduct && p.expired) return 'danger';
    if (this.myProduct && p.paused) return 'muted';
    return 'neutral';
  }

  getClasses() {
    return {
      sold: this.product.sold,
      adjusts: this.myProduct && this.product.waitingAdjustment,
      expired: this.myProduct && this.product.expired,
      waiting: this.myProduct && this.product.waitingPublication,
      paused: this.myProduct && this.product.paused,
      reserved:
        this.product.reserved ||
        this.product.selling ||
        this.product.unavailable,
    };
  }

  openGallery(index: number) {
    const imageUrls = (this.product.images ?? []).map((img) => img.lg);

    this.matDialog.open(TkGalleryComponent, {
      data: { imageUrls, startIndex: index },
      panelClass: 'dialog-gallery',
    });
  }
}
