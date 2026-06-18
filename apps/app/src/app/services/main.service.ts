import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { SearchPageService } from './search-page.service';
import { SearchService } from './search.service';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private router = inject(Router);
  private searchService = inject(SearchService);
  private searchPageService = inject(SearchPageService);
  private firebaseService = inject(FirebaseService);
  private loadingCtrl = inject(LoadingController);
  private navCtrl = inject(NavController);

  homeTab = new Subject();
  searchTab = new Subject();

  registerTab = new Subject();

  negotiationsTab = new Subject();
  profileTab = new Subject();

  // tab stack workaround
  redirectRegister = false;

  productRoutes = ['home', 'search', 'negotiations', 'profile'];

  getRoute() {
    for (const i of this.productRoutes) {
      if (this.router.url.includes(i)) return i;
    }
  }

  navigateToProduct(productId) {
    this.navCtrl.navigateForward(
      `/main/${this.getRoute()}/product/${productId}`,
    );
  }

  navigateToQuestion(productId, questionId?) {
    const base = `/main/${this.getRoute()}/product/${productId}/question`;
    this.navCtrl.navigateForward(questionId ? `${base}/${questionId}` : base);
  }

  navigateToWardrobe(userId) {
    this.navCtrl.navigateForward(
      `/main/${this.getRoute()}/wardrobe/${userId}/${new Date().getTime()}`,
    );
  }

  navigateToCarts(ownerId?) {
    this.navCtrl.navigateForward(`/main/${this.getRoute() ?? 'home'}/carts`);
  }

  navigateToCheckout() {
    this.router.navigateByUrl('/buying/checkout');
  }

  openTrokaiWebsite(url: string) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'app');
    Browser.open({ url: urlObj.href });
  }

  openTrokaiWebsitePath(path: string) {
    const urlObj = new URL(path, 'https://www.trokai.com.br');
    urlObj.searchParams.set('utm_source', 'app');
    Browser.open({ url: urlObj.href });
  }

  async processLink(urlObj: URL, fallbackUrl?: string) {
    const loading = await this.loadingCtrl.create({ message: 'Buscando' });
    loading.present();

    const pathName = urlObj.pathname.split('/');

    try {
      switch (pathName[1].trim()) {
        case 'items': {
          const explode = pathName[2].split('-');
          const id = explode[explode.length - 1];
          this.navigateToProduct(id);
          loading.dismiss();
          break;
        }

        case 'users': {
          const nick = pathName[2];
          const user = await this.searchService.getUserInfo(nick);
          this.navigateToWardrobe(user._id);
          loading.dismiss();
          break;
        }

        case 'search': {
          const filters = {};

          urlObj.searchParams.forEach((value, key) => {
            const _value = !isNaN(Number(value)) ? Number(value) : value;
            if (filters[key] && !(filters[key] instanceof Array))
              filters[key] = [filters[key], _value];
            else if (filters[key] && filters[key] instanceof Array)
              filters[key].push(_value);
            else filters[key] = _value;
          });

          setTimeout(() => {
            this.searchPageService.reset();
            this.searchPageService.homeSearch = true;
            this.searchPageService.setFilters(filters as any);
            this.router.navigate(['/main/search']);
            loading.dismiss();
          }, 500);

          break;
        }

        case '': {
          // do nothing
          loading.dismiss();
          break;
        }

        default: {
          this.openTrokaiWebsite(fallbackUrl ?? urlObj.href);
          loading.dismiss();

          break;
        }
      }
    } catch (err) {
      this.firebaseService.log('DEEP_LINK_ERRO');
      console.error('Error processing link', err);
      loading.dismiss();
    }
  }
}
