import { CostPipe } from '@trokai/shared-ui';
import { Clothes, ClothesStatus } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  PLATFORM_ID,
  inject,
  OnInit,
} from '@angular/core';

import { Basket, BuyingService } from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { ReserveTimeComponent } from '../reserve-time/reserve-time.component';
import { MatIconModule } from '@angular/material/icon';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe, isPlatformServer } from '@angular/common';
import { ProductsHorizontalListComponent } from 'src/app/modules/products-list/products-horizontal-list/products-horizontal-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchService } from 'src/app/search/search.service';
import { Filters } from '@trokai/shared-core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TkUserAvatarComponent } from '@trokai/shared-ui';
import { TkReviewStarsComponent } from '@trokai/shared-ui';
import { CompletingInformationService } from 'src/app/services/completing-information.service';
import { DialogService } from 'src/app/services/dialog.service';
import { User } from '@trokai/shared-core';

@Component({
  selector: 'app-carts',
  templateUrl: './carts.component.html',
  styleUrls: ['./carts.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatButtonModule,
    RouterLink,
    LazyLoadImageModule,
    MatIconModule,
    ReserveTimeComponent,
    CurrencyPipe,
    CostPipe,
    ProductsHorizontalListComponent,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TkUserAvatarComponent,
    TkReviewStarsComponent,
  ],
})
export class CartsComponent implements OnDestroy, OnInit {
  private buyingService = inject(BuyingService);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private completingInformation = inject(CompletingInformationService);
  private dialogService = inject(DialogService);
  private platformId = inject(PLATFORM_ID);

  baskets: Basket[] = [];
  url = environment.imageURL;

  // suggestions
  suggestionHeader: string | null = null;
  suggestionLink: string | null = null;
  suggestions: Clothes[] = [];
  justAdded = false;

  subs!: Subscription;

  async ngOnInit() {
    this.subs = this.buyingService.baskets$.subscribe((baskets) =>
      this.mount(baskets),
    );
    if (this.authService.getUserValue())
      await this.buyingService.getMyReserves(); // to update previous reserves
  }

  openReviews(store: User) {
    if (!store?.reviewsAmount) return;
    this.dialogService.openUserReviews(store);
  }

  async mount(baskets: Basket[]) {
    if (isPlatformServer(this.platformId)) return;

    const params = this.route.snapshot.queryParams;

    // if came from other paths
    if (!params || !params['from']) {
      this.baskets = baskets;
      return;
    }

    // if came from product or wardrobe
    const suggOwner = params['from'];
    const suggBasket = baskets.find((b) => b.owner._id === suggOwner);

    this.justAdded = !!suggOwner;

    if (!suggBasket) {
      this.baskets = baskets;
      this.suggestions = [];
      this.suggestionHeader = null;
      this.suggestionLink = null;
      return;
    }

    try {
      const exclude = suggBasket.products
        .map((p) => p._id)
        .filter((id): id is string => !!id);
      const filter = new Filters({
        status: ClothesStatus.PUBLISHED,
        sell: true,
      });

      this.suggestions = (
        await this.searchService.getClothesOfUser(
          suggOwner,
          0,
          12,
          filter,
          exclude,
        )
      ).clothes;

      // shows suggestions instead of other baskets
      if (this.suggestions.length > 0) {
        this.suggestionHeader = `Mais de ${suggBasket?.owner?.storeName}`;
        this.suggestionLink = `/users/${suggBasket?.owner?.nickname}`;
      } else {
        this.suggestionHeader = null;
        this.suggestionLink = null;
      }

      this.baskets = [suggBasket];
    } catch {
      /* intentional */
    }
  }

  async checkout(ownerId: string) {
    await this.completingInformation.tryStartPurchase(ownerId);
  }

  removeProduct(product: Clothes, ev?: Event) {
    if (ev) ev.stopPropagation();
    this.buyingService.removeProduct(product);
  }

  openOwner(owner: User) {
    this.router.navigateByUrl(`/users/${owner.nickname}`);
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }

  getOwnerAvatar(owner: User) {
    if (owner.avatar && owner.avatar != '') {
      return environment.imageURL + owner._id + '/avatar/' + owner.avatar;
    } else {
      return environment.defaultAvatar1;
    }
  }

  mountProductLink(p: Clothes): string {
    let str = p.title.toString().trim().toLowerCase();

    str = str.replace(/[àáâãäå]/g, 'a');
    str = str.replace(/[èéêë]/g, 'e');
    str = str.replace(/[íìïî]/g, 'i');
    str = str.replace(/[óòõôö]/g, 'o');
    str = str.replace(/[úùüû]/g, 'u');
    str = str.replace(/[ ]/g, '-');

    return `/items/${str}-${p._id}`;
  }
}
