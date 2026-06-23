import { ClothesStatus, User } from '@trokai/shared-core';
import { Clothes } from '@trokai/shared-core';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { BuyingService, Basket } from '@trokai/shared-data-access';
import { SearchService } from '../services/search.service';
import { MainService } from '../services/main.service';
import { ItemViewerComponent } from '../shared/components/item-viewer/item-viewer.component';
import { Filters } from '@trokai/shared-core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { ReserveTimeComponent } from '../buying/reserve-time/reserve-time.component';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  LoadingController,
  ModalController,
  IonImg,
  IonRippleEffect,
  IonIcon,
  IonThumbnail,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import { sadOutline } from 'ionicons/icons';
import { closeOutline } from 'ionicons/icons';
import { CompletingInformationService } from '@trokai/shared-data-access';
import {
  LoadingService,
  CostPipe,
  TkUserAvatarComponent,
} from '@trokai/shared-ui';

@Component({
  selector: 'app-carts',
  templateUrl: './carts.page.html',
  styleUrls: ['./carts.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,

    TkUserAvatarComponent,
    IonIcon,
    IonRippleEffect,
    IonImg,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    BackButtonComponent,
    RouterLink,
    ReserveTimeComponent,
    CurrencyPipe,
    IonThumbnail,
    CostPipe,
  ],
})
export class CartsPage implements OnDestroy, OnInit {
  private buyingService = inject(BuyingService);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private completingInformation = inject(CompletingInformationService);
  private mainService = inject(MainService);
  private modalCtrl = inject(ModalController);
  private loading = inject(LoadingService);

  baskets: Basket[];

  // suggestions
  suggestionHeader;
  suggestionLink;
  suggestions = [];

  subs: Subscription;

  ngOnInit() {
    addIcons({ sadOutline, closeOutline });
    this.subs = this.buyingService.baskets$.subscribe((baskets) =>
      this.mount(baskets),
    );

    if (this.authService.getUserValue()) this.buyingService.getMyReserves(); // to update previous reserves
  }

  goToWardrobe(userId) {
    this.mainService.navigateToWardrobe(userId);
  }

  async mount(baskets: Basket[]) {
    const params = this.route.snapshot.queryParams;

    // if came from other paths
    if (!params || !params['from']) {
      this.baskets = baskets;
      return;
    }

    // if came from product or wardrobe
    const suggOwner = params['from'];
    const suggBasket = baskets.find((b) => b.owner._id === suggOwner);

    if (!suggBasket) {
      this.baskets = baskets;
      this.suggestions = [];
      this.suggestionHeader = null;
      this.suggestionLink = null;
      return;
    }

    try {
      const exclude = suggBasket.products.map((p) => p._id);
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

  async openWardrobe(owner: User) {
    this.mainService.navigateToWardrobe(owner._id);
  }

  async open(product) {
    const modal = await this.modalCtrl.create({
      component: ItemViewerComponent,
      cssClass: 'modal-85',
      componentProps: {
        product: product,
        canFavorite: true,
        canEdit: false,
        canShare: false,
      },
    });

    modal.present();
  }

  removeProduct(product: Clothes) {
    this.buyingService.removeProduct(product);
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }
}
