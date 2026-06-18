import { Component, NgZone, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';

import Swiper from 'swiper';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { ZoomOptions } from 'swiper/types';

export interface GalleryData {
  imageUrls: string[];
  startIndex: number;
}

@Component({
  selector: 'tk-gallery',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './tk-gallery.component.html',
  styleUrl: './tk-gallery.component.scss',
})
export class TkGalleryComponent implements OnInit {
  swiperRef!: Swiper;
  isMobile = false;

  private ngZone = inject(NgZone);
  private bpObserver = inject(BreakpointObserver);
  public dialogRef = inject(MatDialogRef<TkGalleryComponent>);
  public data = inject<GalleryData>(MAT_DIALOG_DATA);

  ngOnInit() {
    this.bpObserver
      .observe('(max-width: 600px)')
      .subscribe((result) => (this.isMobile = result.matches));
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.swiperRef = new Swiper('.gallery-swiper', {
          modules: [Navigation, Pagination, Zoom],
          initialSlide: this.data.startIndex,
          slidesPerView: 1,
          spaceBetween: 10,
          zoom: { maxRatio: 2 } as ZoomOptions,
          loop: true,
          navigation: {
            nextEl: '.custom-next.gallery',
            prevEl: '.custom-prev.gallery',
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
        });
      }, 0); // avoid ExpressionChangedAfterItHasBeenCheckedError
    });
  }

  onClickZoomContainer(event: MouseEvent) {
    event.stopPropagation();

    if (this.isMobile) return; // mobile zoom via double tap / pinch

    if (this.swiperRef && this.swiperRef.zoom)
      this.swiperRef.zoom.toggle(event);
  }
}
