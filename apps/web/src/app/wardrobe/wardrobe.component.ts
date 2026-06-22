import { SellerStatus, StoreVisibility, User, UserReview } from '@trokai/shared-core';
import { Clothes, ClothesStatus } from '@trokai/shared-core';
import { InventoryService } from './inventory.service';
import { AuthService } from './../auth/auth.service';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { isPlatformServer, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TkReviewStarsComponent } from '@trokai/shared-ui';
import { DialogService } from '../services/dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import {
  Paginator,
  PaginatorComponent,
} from '../search/paginator/paginator.component';
import { SearchService } from '../search/search.service';
import { lastValueFrom, skip } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { statusForOwner } from './status-list';
import { AlertService } from '@trokai/shared-ui';
import { Filters, SearchResponse } from '@trokai/shared-core';
import { MatBadgeModule } from '@angular/material/badge';
import { TkProductCardComponent } from '@trokai/shared-ui';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from '../search/filter-dialog/filter-dialog.component';
import { TkSellerHeaderComponent } from '@trokai/shared-ui';
import { TkSellerStatusBadgeComponent } from '@trokai/shared-ui';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-wardrobe',
  templateUrl: './wardrobe.component.html',
  styleUrls: ['./wardrobe.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [
    MatIconModule,
    MatTooltipModule,
    TkReviewStarsComponent,
    MatButtonModule,
    MatBadgeModule,
    RouterLink,
    TkProductCardComponent,
    PaginatorComponent,
    MatSelectModule,
    FormsModule,
    NgClass,
    TkSellerHeaderComponent,
    TkSellerStatusBadgeComponent,
  ],
})
export class WardrobeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private searchService = inject(SearchService);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private globalService = inject(GlobalService);
  private alert = inject(AlertService);
  private matDialog = inject(MatDialog);
  private dialogService = inject(DialogService);

  url = '';
  items: Clothes[] = [];
  owner!: User;
  user!: User;
  reviews: UserReview[] | null = null;

  filter: Filters = new Filters();

  statusList: { name: string; value: ClothesStatus | null }[] = [];

  userOwner = false;
  storeVisibility = StoreVisibility;
  sellerStatus = SellerStatus;

  paginator!: Paginator;
  activePage = 0;

  response?: SearchResponse;

  lastNickname: string | null = null;
  limit = 30;

  showRenewAll = false;

  countString: string | null = null;
  pageString: string | null = null;

  openReviews(store: User) {
    if (!store?.reviewsAmount) return;
    this.dialogService.openUserReviews(store);
  }

  ngOnInit() {
    this.authService.user.subscribe((u) => {
      if (u) this.user = u;
    });
    this.url = environment.imageURL;

    this.processParams();

    this.route.params.pipe(skip(1)).subscribe(() => this.processParams());
    this.route.queryParams.pipe(skip(1)).subscribe(() => this.processParams());
  }

  statusChange() {
    this.router.navigate(['/users', this.owner.nickname], {
      queryParams: {
        page: 1,
        ...this.filter,
      },
    });
  }

  clearSearch() {
    this.filter.text = '';

    this.router.navigate(['/users', this.owner.nickname], {
      queryParams: {
        page: 1,
      },
    });
  }

  searchText() {
    this.applyFilters({
      ...this.filter,
    } as Filters);
  }

  summarizeStatusList(list: { name: string; value: ClothesStatus | null }[]) {
    const newList = JSON.parse(JSON.stringify(list));
    const summary = this.owner.clothesSummary;

    if (!summary) {
      this.statusList = newList;
      return;
    }

    for (let i = 0; i < newList.length; i++) {
      if (newList[i].value == null) {
        newList[i].name += ` (${summary.reduce((a, b) => a + b.count, 0)})`;
        continue;
      }

      const count =
        summary.find((s) => s.status === newList[i].value)?.count || 0;
      newList[i].name += ` (${count})`;
    }

    this.statusList = newList;
    this.showRenewAll =
      (summary.find((s) => s.status === ClothesStatus.EXPIRED)?.count ?? 0) > 0;
  }

  async processParams() {
    try {
      const params = this.route.snapshot.queryParams;
      this.items = [];

      // checa a pagina pro paginator
      if (params.page) {
        this.activePage = parseInt(params.page);
        if (this.activePage > 0) this.activePage--;
      }

      const nickname = this.route.snapshot.params['owner_nickname'];
      if (!nickname) return;

      this.filter = new Filters({ ...params });

      // evita buscar o mesmo usuario quando muda de pagina
      if (this.lastNickname !== nickname) {
        // busca o usuario
        this.owner = await this.searchService.getUserInfo(nickname);
        const user = this.authService.getUserValue();
        this.userOwner = user?._id === this.owner._id;
        // set metas
        this.globalService.setTitle(this.owner.storeName);
        this.globalService.setMetaDescription(
          `Veja os produtos de ${this.owner.storeName} no Trokaí.`,
        );
      }

      if (!this.userOwner) {
        this.filter.status = ClothesStatus.PUBLISHED;

        this.response = await this.searchService.getClothesOfUser(
          nickname,
          this.activePage * this.limit,
          this.limit,
          this.filter,
          [],
          true,
        );
      } else {
        this.summarizeStatusList(statusForOwner);

        // não da pra buscar o armario logado se server (sem auth)
        if (isPlatformServer(this.platformId)) return;

        this.response = await this.inventoryService.getMyClothes(
          this.activePage * this.limit,
          this.limit,
          this.filter,
        );
      }

      // se foi pra paginas acima do limite, redireciona pra ultima pagina
      if (!this.response.clothes.length && this.response.count) {
        this.router.navigate(['/users', nickname], {
          queryParams: { page: 1 },
        });
        return;
      }

      this.items = this.response.clothes;

      if (this.response.count > 0) {
        this.paginator = new Paginator(
          this.activePage + 1,
          this.response.count / this.limit,
        );
      }

      // if (isPlatformBrowser(this.platformId) && this.lastNickname !== nickname)
      //   this.reviews = await this.searchService.getUserReviews(nickname);

      this.lastNickname = nickname;

      this.mountCountString(this.response.clothes.length, this.response.count);
    } catch (_error) {
      this.router.navigate(['/']);
    }
  }

  fetch() {
    /* intentional */
  }

  getOwnerAvatar() {
    if (this.owner.avatar && this.owner.avatar != '') {
      return (
        environment.imageURL + this.owner._id + '/avatar/' + this.owner.avatar
      );
    } else {
      return environment.defaultAvatar1;
    }
  }

  async showFiltersDialog() {
    const dialogRef = this.matDialog.open(FilterDialogComponent, {
      data: { filter: this.filter },
      panelClass: 'dialog-large',
    });

    const result = await lastValueFrom(dialogRef.afterClosed());
    if (result?.filter) this.applyFilters(result.filter);
  }

  async renewAll() {
    try {
      const n = this.items.filter(
        (el) => el.status === ClothesStatus.EXPIRED,
      ).length;

      const msg =
        n > 1
          ? `Você possui ${n} anúncios expirados.`
          : `Você possui ${n} anúncio expirado`;

      if (
        !(await this.alert.question(msg, 'Renovar tudo', 'Renovar', 'Cancelar'))
      )
        return;

      await this.inventoryService.renewAll(this.user._id);
      this.lastNickname = null; // force reload user info (summary)
      await this.processParams();

      this.alert.alert('Anúncios renovados!');
    } finally {
      /* intentional */
    }
  }

  mountCountString(current: number, total: number) {
    this.countString = null;
    this.pageString = null;

    if (current == 0) {
      this.countString = null;
      return;
    }
    if (current == 1) {
      this.countString = '1 resultado ';
      return;
    }

    if (current == total) {
      this.countString = `${total} resultados `;
      return;
    }

    this.countString = `${current} de ${total} resultados `;
    const pages = Math.ceil(total / this.limit);
    if (pages == 1) return;

    this.pageString = `Página ${this.activePage + 1} de ${pages}`;
  }

  applyFilters(filters: Filters) {
    filters = new Filters({ ...filters });

    this.router.navigate(['/users', this.lastNickname], {
      queryParams: { ...filters.getUrlParams(), page: 1 },
    });
  }

  goToSellerStatus() {
    this.router.navigateByUrl('/account/seller-status');
  }
}
