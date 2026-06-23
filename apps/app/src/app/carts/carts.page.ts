import { Clothes, User } from '@trokai/shared-core';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { BuyingService, Basket } from '@trokai/shared-data-access';
import { MainService } from '../services/main.service';
import { ItemViewerComponent } from '../shared/components/item-viewer/item-viewer.component';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { TkCartComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-carts',
  templateUrl: './carts.page.html',
  styleUrls: ['./carts.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    BackButtonComponent,
    TkCartComponent,
  ],
})
export class CartsPage implements OnDestroy, OnInit {
  private buyingService = inject(BuyingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private completingInformation = inject(CompletingInformationService);
  private mainService = inject(MainService);
  private modalCtrl = inject(ModalController);

  baskets: Basket[] = [];
  justAdded = false;

  subs!: Subscription;

  ngOnInit() {
    this.subs = this.buyingService.baskets$.subscribe((baskets) =>
      this.mount(baskets),
    );

    if (this.authService.getUserValue()) this.buyingService.getMyReserves();
  }

  async mount(baskets: Basket[]) {
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
      return;
    }

    // The app keeps the matching basket; suggestions are web-only for now.
    this.baskets = [suggBasket];
  }

  async checkout(ownerId: string) {
    await this.completingInformation.tryStartPurchase(ownerId);
  }

  removeProduct(product: Clothes) {
    this.buyingService.removeProduct(product);
  }

  openWardrobe(owner: User) {
    this.mainService.navigateToWardrobe(owner._id);
  }

  async openProduct(product: Clothes) {
    const modal = await this.modalCtrl.create({
      component: ItemViewerComponent,
      cssClass: 'modal-85',
      componentProps: {
        product,
        canFavorite: true,
        canEdit: false,
        canShare: false,
      },
    });
    modal.present();
  }

  browseProducts() {
    this.router.navigateByUrl('/main/search');
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }
}
