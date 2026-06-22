import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { SearchService } from '../services/search.service';
import { environment } from 'src/environments/environment';

import { MainService } from '../services/main.service';
import { NotificationsService } from '@trokai/shared-data-access';
import {
  HomePayloadRow,
  HomePayloadRowItem,
  HomeService,
} from '../services/home.service';
import { MessagesService } from '@trokai/shared-data-access';
import { BuyingService } from '@trokai/shared-data-access';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { BannerComponent } from './banner/banner.component';
import { HomeGenericComponent } from './home-generic/home-generic.component';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonToolbar,
  IonBadge,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import {
  cartOutline,
  helpCircleOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,

    IonBadge,
    IonHeader,
    IonToolbar,
    IonImg,
    IonButtons,
    IonIcon,
    IonContent,
    RouterLink,
    NgIf,
    NgFor,
    BannerComponent,
    HomeGenericComponent,
  ],
})
export class HomePage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  private notificationsService = inject(NotificationsService);
  private mainService = inject(MainService);
  public searchService = inject(SearchService);
  private messagesService = inject(MessagesService);
  private homeService = inject(HomeService);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);
  private buyingservice = inject(BuyingService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  url;

  //new home
  payload?: { home: HomePayloadRow[]; alert?: string };
  swiperBindTimer;

  basketCount = 0;
  notificationCount = 0;
  messageCount = 0;

  async ngOnInit() {
    addIcons({ notificationsOutline, cartOutline, helpCircleOutline });
    this.url = environment.imageURL;

    this.mainService.homeTab.subscribe(() => {
      this.content.scrollToTop(400); // rola a pagina ao escolher um item
    });

    this.notificationsService.notReadedCount$.subscribe((count) => {
      this.notificationCount = count;
      this.changeDetectorRef.detectChanges();
    });

    this.messagesService.notReadCount$.subscribe((count) => {
      this.messageCount = count;
      this.changeDetectorRef.detectChanges();
    });

    this.buyingservice.baskets$.subscribe((baskets) => {
      if (!baskets || !baskets.length) {
        this.basketCount = 0;
        return;
      }
      this.basketCount = baskets.reduce((acc, basket) => {
        return acc + basket.products.length;
      }, 0);
    });

    await this.fetchHome();
  }

  async fetchHome() {
    const payload = await this.homeService.fetchHome();

    this.payload = {
      home: payload.home.filter((item) => item.visibleApp),
      alert: payload.alert,
    };

    this.bindSwiper();
  }

  bindSwiper() {
    this.swiperBindTimer = this.swiperBindTimer = setTimeout(() => {
      for (let i = 0; i < this.payload.home.length; i++) {
        if (!this.payload.home[i].swiper) continue;

        if (this.payload.home[i].objectType == 'banner') {
          this.payload.home[i].itemsPerSlide = 1;
          this.payload.home[i].itemsPerSlideMobile = 1;
        }

        const slides = this.payload.home[i].itemsPerSlideMobile;

        const swiperEl: Element = this.el.nativeElement.querySelector(
          `#swiper-${i}`,
        );

        // if (swiperEl && swiperEl.swiper) {
        //   const items = this.payload[i].items.length;
        //   const itemsPerSlideMobile = this.payload[i].itemsPerSlideMobile;

        //   if (items == 1) {
        //     if (swiperEl.swiper && swiperEl.swiper.navigation)
        //       swiperEl.swiper.navigation.destroy();

        //     if (swiperEl.swiper && swiperEl.swiper.navigation)
        //       swiperEl.swiper.navigation.destroy();
        //   } else if (items > itemsPerSlideMobile) {
        //     swiperEl.swiper.enable();
        //   }
        // }

        // this.renderer.setAttribute(swiperEl, "slides-per-view", "auto");
        // this.renderer.setAttribute(swiperEl, "free-mode", "true");
        // this.renderer.setAttribute(swiperEl, "space-between", "0");

        const total = this.payload.home[i].items.length;
        const max = 100; //vw
        const slideWidth = (max / slides) * 0.8;

        if (slides < total) {
          this.renderer.setStyle(swiperEl, 'padding-left', '1.2rem');

          const children = swiperEl.querySelectorAll('.custom-swiper-slide');
          children.forEach((child) => {
            this.renderer.setStyle(child, 'width', `${slideWidth}vw`);
            this.renderer.setStyle(child, 'min-width', `${slideWidth}vw`);

            this.renderer.setStyle(child, 'margin-right', '1.2rem');
          });
        } else {
          this.renderer.setStyle(swiperEl, 'margin', '1.2rem');
        }
      }
    });
  }

  navigate(home_row: HomePayloadRow | HomePayloadRowItem) {
    this.homeService.navigate(home_row);
  }
}
