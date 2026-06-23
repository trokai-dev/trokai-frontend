import { ClothesStatus, StoreVisibility, User } from '@trokai/shared-core';
import { Clothes } from '@trokai/shared-core';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  inject,
} from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '@trokai/shared-data-access';

import { Share } from '@capacitor/share';
import {
  StatusPillComponent,
  TkSellerHeaderComponent,
} from '@trokai/shared-ui';
import { environment } from 'src/environments/environment';
import { SearchService } from '../services/search.service';
import { statusForOwner } from './status-list';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '../services/main.service';
import { Filters, SearchResponse } from '@trokai/shared-core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { NgStyle } from '@angular/common';
import { TkReviewStarsComponent } from '@trokai/shared-ui';
import { ReviewsListComponent } from '../shared/components/reviews-list/reviews-list.component';
import { FormsModule } from '@angular/forms';
import { FilterTagsComponent } from '../shared/components/filter-tags/filter-tags.component';
import { TkProductCardComponent } from '@trokai/shared-ui';
import {
  IonSearchbar,
  NavController,
  ModalController,
  IonHeader,
  IonButtons,
  IonContent,
  IonIcon,
  IonToolbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonTitle,
  IonRefresher,
  IonRefresherContent,
  IonChip,
  IonSpinner,
  IonList,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import {
  pencil,
  shareSocial,
  search,
  sadOutline,
  createOutline,
  create,
} from 'ionicons/icons';
import { AlertService } from '@trokai/shared-ui';
import { FirebaseService } from '../services/firebase.service';
import { ToastService } from '../services/toast-service';

@Component({
  selector: 'app-wardrobe',
  templateUrl: './wardrobe.page.html',
  styleUrls: ['./wardrobe.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,

    StatusPillComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    IonIcon,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    TkSellerHeaderComponent,
    IonChip,
    IonSearchbar,
    IonSpinner,
    IonList,
    BackButtonComponent,
    TkReviewStarsComponent,
    FormsModule,
    FilterTagsComponent,
    NgStyle,
    TkProductCardComponent,
  ],
})
export class WardrobePage implements OnInit, OnDestroy {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;

  private authService = inject(AuthService);
  private userService = inject(UserService);
  public inventoryService = inject(InventoryService);
  private alertService = inject(AlertService);
  private toastService = inject(ToastService);
  private firebaseService = inject(FirebaseService);
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mainService = inject(MainService);

  items?; // todas as pecas

  subsUser: Subscription;
  subsPub: Subscription;
  url = environment.imageURL;

  user: User; // logado
  owner: User; // dono do armario

  filter = new Filters();

  reviews = null;
  showRenewAll = false;

  limit = 16;
  showSearchbar = false;

  searchText = '';
  statusFilter = [];

  storeVisibility = StoreVisibility;
  endOfSearch = false;

  userIsOwner = false;

  get isLoading() {
    return !this.items;
  }

  async openReviews() {
    if (!this.reviews || this.reviews.length === 0) return;
    const modal = await this.modalCtrl.create({
      component: ReviewsListComponent,
      componentProps: { reviews: this.reviews, user: this.owner },
    });
    modal.present();
  }

  async ngOnInit() {
    addIcons({
      create,
      shareSocial,
      search,
      sadOutline,
      createOutline,
      pencil,
    });

    this.subsUser = this.authService.user.subscribe(async (u) => {
      if (u && this.user && this.user._id === u._id) return; // user didn't change
      this.user = u;
      this.load();
    });

    this.inventoryService._recentProducts.subscribe(async (recentProducts) => {
      if (
        !this.userIsOwner ||
        !this.owner ||
        !recentProducts ||
        !recentProducts.size
      )
        return;

      let nextFilterStatus = ClothesStatus.WAITING_PUBLICATION;

      for (const [id, product] of recentProducts) {
        if (product) nextFilterStatus = product.status ?? nextFilterStatus;
      }

      await this.applyFilters(this.filter);

      this.owner = await this.searchService.getUserInfo(this.owner._id);
      this.summarizeStatusList();

      this.changeDetectorRef.detectChanges();
    });
  }

  startSearch() {
    this.showSearchbar = true;
    this.changeDetectorRef.detectChanges();

    setTimeout(() => {
      this.searchbar.setFocus();
    }, 300);
  }

  async load() {
    let ownerRef;

    const user = this.authService.getUserValue();
    ownerRef = this.route.snapshot.paramMap.get('owner_id');
    this.filter.status = ClothesStatus.PUBLISHED;

    if (!user) {
      this.userIsOwner = false;
    } else {
      if (this.router.url.includes('inventory')) {
        ownerRef = user._id;
        this.userIsOwner = true;
        this.filter.status = null;
      } else {
        this.userIsOwner =
          ownerRef === user._id || ownerRef === user.seller?.nickname;

        if (!ownerRef) {
          this.router.navigate(['/main/home']);
          return;
        }
      }
    }

    this.owner = await this.searchService.getUserInfo(ownerRef);
    await this.fetchProducts();
    this.reviews = await this.userService.getUserReviews(this.owner._id);
  }

  async fetchProducts() {
    this.endOfSearch = false;

    const filters = new Filters();
    Object.assign(filters, { ...this.filter, sorting: 'recent' });
    if (filters.status == null) delete filters.status;

    this.summarizeStatusList();

    let response: SearchResponse;

    if (!this.userIsOwner) {
      response = await this.searchService.getClothesOfUser(
        this.owner._id,
        this.items?.length ?? 0,
        this.limit,
        filters,
      );
    } else {
      response = await this.inventoryService.getMyClothes(
        this.items?.length ?? 0,
        this.limit,
        filters,
      );
    }

    if (response) {
      if (!this.items) this.items = [];
      this.items = this.items.concat(response.clothes);
      this.endOfSearch = response.count <= this.items.length;
    }
  }

  async doRefresh(event?) {
    try {
      this.items = undefined;
      await this.load();
    } finally {
      if (event) event.target.complete();
    }
  }

  async loadData(event) {
    try {
      await this.fetchProducts();
    } finally {
      event.target.complete();
    }
  }

  ngOnDestroy() {
    this.items = [];
    this.subsUser.unsubscribe();
  }

  async shareWardrobe() {
    const text = `Veja os looks de ${
      this.owner.seller?.storeName ?? this.owner.name
    } no Trokaí`;

    await Share.share({
      title: this.owner.seller?.storeName ?? this.owner.name,
      text: text,
      url: 'https://www.trokai.com.br/users/' + this.owner.seller?.nickname,
      dialogTitle: 'Compartilhar armário',
    });

    this.firebaseService.log('SHARE_ARMARIO_USER');
  }

  // async changeFilter(status: ClothesStatus) {
  //   this.items = undefined;
  //   this.filter.status = status;
  //   await this.fetchProducts();
  // }

  async open(p) {
    if (this.userIsOwner) {
      this.navCtrl.navigateForward(`/main/profile/inventory/product/${p._id}`);
    } else {
      this.mainService.navigateToProduct(p._id);
    }
  }

  async editWardrobe() {
    if (!this.userIsOwner) return;
    this.navCtrl.navigateForward('/main/profile/options/store');
  }

  async renewAll() {
    if (!this.userIsOwner) return;

    const n = this.items.filter(
      (el) => el.status === ClothesStatus.EXPIRED,
    ).length;

    const msg =
      n > 1
        ? `Você possui ${n} anúncios expirados.`
        : `Você possui ${n} anúncio expirado`;

    if (
      !(await this.alertService.askQuestion(
        'Renovar tudo',
        msg,
        'Renovar',
        'Cancelar',
      ))
    )
      return;

    await this.inventoryService.renewAll(this.user._id);
    this.applyFilters(new Filters()); // reseta filtro
    this.toastService.makeToast('Anúncios renovados!');
  }

  // search
  enter(event?) {
    if (event && event.key !== 'Enter') return;

    if (!this.searchText || !this.searchText.length) {
      this.clearSearch();
      return;
    }

    this.filter.text = this.searchText;
    this.items = undefined;
    this.fetchProducts();
  }

  blurSearch() {
    if (!this.searchText || !this.searchText.length) {
      if (this.filter.text && this.filter.text.length) this.clearSearch();
      else this.showSearchbar = false;
    }
  }

  clearSearch() {
    this.showSearchbar = false;
    this.searchText = '';
    this.filter.text = '';
    this.items = undefined;
    this.fetchProducts();
  }

  summarizeStatusList() {
    if (!this.userIsOwner || !this.owner) return;

    const newList = JSON.parse(JSON.stringify(statusForOwner));
    const summary = this.owner.seller?.health?.clothesSummary;

    if (!summary) {
      this.statusFilter = newList;
      return;
    }

    for (let i = 0; i < newList.length; i++) {
      if (newList[i].value == null) continue;

      const count =
        summary.find((s) => s.status === newList[i].value)?.count || 0;
      newList[i].name += ` (${count})`;
    }

    const indexAll = newList.findIndex((el) => el.value == null);

    const countAll = summary
      .filter((el) => statusForOwner.find((l) => l.value === el.status))
      .reduce((a, b) => a + b.count, 0);

    newList[indexAll].name += ` (${countAll})`;

    this.statusFilter = newList;
    this.showRenewAll =
      summary.find((s) => s.status === ClothesStatus.EXPIRED)?.count > 0;
  }

  applyFilters(filters: Filters) {
    this.items = undefined;
    this.filter = filters;
    this.filter.text = this.searchText;
    this.fetchProducts();
  }
}
