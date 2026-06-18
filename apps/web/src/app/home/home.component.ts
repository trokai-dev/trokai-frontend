import { HomePayloadRow, HomePayloadRowItem } from '@trokai/shared-core';
import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  afterNextRender,
  Injector,
  inject,
} from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../services/global.service';
import { HomeService } from '../services/home.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HomeGenericComponent } from './home-generic/home-generic.component';
import { BannerComponent } from './banner/banner.component';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { BrowserRef } from '../services/browser-ref.service';
import { TkReviewStarsComponent } from '@trokai/shared-ui';
import { BreakpointObserver } from '@angular/cdk/layout';

export { HomePayloadRow, HomePayloadRowItem };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    BannerComponent,
    HomeGenericComponent,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    TkReviewStarsComponent,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private globalService = inject(GlobalService);
  private homeService = inject(HomeService);
  private bpObserver = inject(BreakpointObserver);
  private browserRef = inject(BrowserRef);
  private ngZone = inject(NgZone);
  private injector = inject(Injector);
  private platformId = inject(PLATFORM_ID);

  url = environment.imageURL;
  payload?: HomePayloadRow[] = [];
  viewportHeight = 0;

  ratings: { name: string; text: string; rating: number; date: string }[] = [];

  mainswiperRef!: Swiper;
  ratingsSwiperRef!: Swiper;
  isMobile = false;

  ngOnInit(): void {
    this.viewportHeight = this.browserRef.window?.innerHeight || 0;

    this.ngZone.runOutsideAngular(() => {
      this.bpObserver.observe('(max-width: 600px)').subscribe((result) => {
        // Only enter zone if value actually changes to avoid microtask spam
        if (this.isMobile !== result.matches) {
          this.ngZone.run(() => (this.isMobile = result.matches));
        }
      });
    });
    this.globalService.setTitle(
      'Trokaí - Compre dos melhores brechós com segurança e praticidade.',
    );
    this.globalService.setMetaDescription(
      'Compre dos melhores brechós com segurança e praticidade.',
    );
    this.fetchHome();
  }

  setStyles(payload: HomePayloadRow[]) {
    payload.forEach((row) => {
      row.itemMobileWidth = `${(100 / (row.itemsPerSlideMobile ?? 1)) * 0.8}vw`;
    });
  }

  async fetchHome() {
    try {
      const res = await this.homeService.fetchHome();
      this.ratings = res.ratings ?? [];

      const payload = res.home;
      this.setStyles(payload);
      this.payload = payload;
      this.mapUrls(this.payload);
      this.loadSwiper();
    } catch {
      /* intentional */
    }
  }

  loadSwiper() {
    afterNextRender(
      {
        write: () => {
          this.ngZone.runOutsideAngular(() => {
            if (this.mainswiperRef) this.mainswiperRef.destroy();
            if (this.ratingsSwiperRef) this.ratingsSwiperRef.destroy();

            this.mainswiperRef = new Swiper('.banner-swiper', {
              modules: [Pagination, Navigation, Autoplay],
              loop: true,
              pagination: { el: '.swiper-pagination' },
              navigation: {
                nextEl: '.custom-next.banner',
                prevEl: '.custom-prev.banner',
              },
              autoplay: { delay: 5000 },
            });

            this.ratingsSwiperRef = new Swiper('.ratings-swiper', {
              modules: [Navigation, Autoplay],
              loop: true,
              navigation: {
                nextEl: '.custom-next.ratings',
                prevEl: '.custom-prev.ratings',
              },
              slidesPerView: this.isMobile ? 'auto' : 4,
              spaceBetween: 16,
            });
          });
        },
      },
      { injector: this.injector },
    );
  }

  mapUrl(item: HomePayloadRowItem | HomePayloadRow) {
    if (!item.actionUrl) return;
    const urlObj = new URL(item.actionUrl);
    if (urlObj.hostname === 'www.trokai.com.br') {
      const pathName = urlObj.pathname.split('/');
      switch (pathName[1]) {
        case 'items': {
          item.route = '/items/' + pathName[2];
          break;
        }
        case 'users': {
          item.route = '/users/' + pathName[2];
          break;
        }
        case 'search': {
          const route = '/search';
          const queryParams: Record<string, unknown> = {};
          urlObj.searchParams.forEach((value, key) => {
            const _val = !isNaN(Number(value)) ? Number(value) : value;
            if (queryParams[key] != null) {
              if (!Array.isArray(queryParams[key]))
                queryParams[key] = [queryParams[key]];
              (queryParams[key] as unknown[]).push(_val);
            } else {
              queryParams[key] = _val;
            }
          });
          item.route = route;
          if (queryParams) item.queryParams = queryParams;
          break;
        }
        default: {
          item.route = undefined;
        }
      }
    }
  }

  mapUrls(payload: HomePayloadRow[]) {
    payload.forEach((row) => {
      this.mapUrl(row);
      row.items?.forEach((item) => {
        this.mapUrl(item);
      });
    });
  }

  ngOnDestroy() {
    if (this.mainswiperRef) this.mainswiperRef.destroy(true, true);

    if (this.ratingsSwiperRef) this.ratingsSwiperRef.destroy(true, true);
  }
}
