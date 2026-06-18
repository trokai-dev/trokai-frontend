import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NgZone,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import Swiper from 'swiper';
import { GlobalService } from '../services/global.service';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-seller-onboarding',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatButtonModule, MatIconModule, MatCheckboxModule, FormsModule],
  templateUrl: './seller-onboarding.component.html',
  styleUrls: ['./seller-onboarding.component.scss'],
})
export class SellerOnboardingComponent {
  private ngZone = inject(NgZone);
  private globalService = inject(GlobalService);
  private completingInformationService = inject(CompletingInformationService);

  @ViewChild('swiperEl') swiperEl!: ElementRef;
  swiperRef!: Swiper;
  activeIndex = 0;
  accepted = false;
  minClothesToSell = 5;

  constructor() {
    this.globalService.params.subscribe((params) => {
      this.minClothesToSell = params?.minClothesToSell || 5;
    });

    afterNextRender(() => {
      this.ngZone.runOutsideAngular(() => {
        this.swiperRef = new Swiper(this.swiperEl.nativeElement, {
          slidesPerView: 1,
          spaceBetween: 16,
          loop: false,
        });

        this.swiperRef.on('slideChange', () => {
          this.ngZone.run(() => {
            this.activeIndex = this.swiperRef.activeIndex;
          });
        });
      });
    });
  }

  get isLastSlide() {
    return this.activeIndex === 2;
  }

  get isFirstSlide() {
    return this.activeIndex === 0;
  }

  async start() {
    try {
      await this.completingInformationService.openSellerAccount();
      await this.completingInformationService.next();
    } catch (error) {
      console.error('Error starting seller account:', error);
    }
  }

  prev() {
    this.swiperRef?.slidePrev();
  }

  next() {
    this.swiperRef?.slideNext();
  }
}
