import { Clothes, User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  PLATFORM_ID,
  inject,
  OnInit,
} from '@angular/core';
import { Basket, BuyingService } from '@trokai/shared-data-access';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { DialogService } from 'src/app/services/dialog.service';
import { TkCartComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-carts',
  templateUrl: './carts.component.html',
  styleUrls: ['./carts.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [TkCartComponent],
})
export class CartsComponent implements OnDestroy, OnInit {
  private buyingService = inject(BuyingService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private completingInformation = inject(CompletingInformationService);
  private dialogService = inject(DialogService);
  private platformId = inject(PLATFORM_ID);

  baskets: Basket[] = [];

  subs!: Subscription;

  async ngOnInit() {
    this.subs = this.buyingService.baskets$.subscribe((baskets) =>
      this.mount(baskets),
    );
    if (this.authService.getUserValue())
      await this.buyingService.getMyReserves();
  }

  mount(baskets: Basket[]) {
    if (isPlatformServer(this.platformId)) return;
    this.baskets = baskets;
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
