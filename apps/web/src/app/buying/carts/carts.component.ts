import { Clothes, ClothesStatus, Filters, User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  PLATFORM_ID,
  inject,
  OnInit,
} from '@angular/core';
import { Basket, BuyingService } from '@trokai/shared-data-access';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { ProductsHorizontalListComponent } from 'src/app/modules/products-list/products-horizontal-list/products-horizontal-list.component';
import { SearchService } from 'src/app/search/search.service';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { DialogService } from 'src/app/services/dialog.service';
import { TkCartComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-carts',
  templateUrl: './carts.component.html',
  styleUrls: ['./carts.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ProductsHorizontalListComponent, TkCartComponent],
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
      await this.buyingService.getMyReserves();
  }

  async mount(baskets: Basket[]) {
    if (isPlatformServer(this.platformId)) return;

    const params = this.route.snapshot.queryParams;

    if (!params || !params['from']) {
      this.baskets = baskets;
      return;
    }

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

      if (this.suggestions.length > 0) {
        this.suggestionHeader = `Mais de ${suggBasket?.owner?.seller?.storeName}`;
        this.suggestionLink = `/users/${suggBasket?.owner?.seller?.nickname}`;
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

  removeProduct(product: Clothes) {
    this.buyingService.removeProduct(product);
  }

  openOwner(owner: User) {
    this.router.navigateByUrl(`/users/${owner.seller?.nickname}`);
  }

  openReviews(store: User) {
    if (!store?.seller?.health?.reviewsAmount) return;
    this.dialogService.openUserReviews(store);
  }

  openProduct(product: Clothes) {
    this.router.navigateByUrl(`/items/${product._id}`);
  }

  browseProducts() {
    this.router.navigateByUrl('/search');
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }
}
