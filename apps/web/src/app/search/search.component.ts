import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { Paginator, PaginatorComponent } from './paginator/paginator.component';
import { SearchService } from './search.service';
import { ItemsMap } from '@trokai/shared-core';

import { TkProductCardComponent } from '@trokai/shared-ui';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Clothes, Filters } from '@trokai/shared-core';
import { SearchPageService } from '../services/search-page.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { first, lastValueFrom } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SortingDialogComponent } from './sorting-dialog/sorting-dialog.component';
import { MarketingService } from '../services/marketing.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    SearchFilterComponent,
    FormsModule,
    MatBadgeModule,
    TkProductCardComponent,
    PaginatorComponent,
    MatSelectModule,
    MatFormFieldModule,
  ],
})
export class SearchComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private searchPageService = inject(SearchPageService);
  private globalService = inject(GlobalService);
  private marketingService = inject(MarketingService);
  private matDialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  results: Clothes[] = [];
  filters: Filters = new Filters();
  itemsMap?: ItemsMap;

  paginator!: Paginator;
  activePage = 0;

  countString: string | null = null;
  pageString: string | null = null;

  limit = 60;
  mobileSearchText = '';

  @ViewChild(PaginatorComponent) paginatorComponent!: PaginatorComponent;

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef)) // Inject DestroyRef in constructor
      .subscribe((params: Params) => {
        this.processParams({ ...params });
      });

    // For the global items map, if you only need it once for the render:
    this.globalService.itemsMap
      .pipe(first((res) => !!res)) // Only take the first valid value
      .subscribe((res) => {
        this.itemsMap = res;
      });

    if (this.route.snapshot.queryParams['coupon']) {
      this.marketingService.checkCoupon(
        this.route.snapshot.queryParams['coupon'],
      );
      return;
    }
  }

  async processParams(params: Params) {
    this.setMeta(params);

    if (params.page) {
      this.activePage = parseInt(params.page);
      if (this.activePage > 0) this.activePage--;
    }

    // page
    this.filters = new Filters(params);
    this.mobileSearchText = this.filters.text ?? '';
    this.searchPageService.setMainSearchText(this.filters.text ?? '');
    this.searchClothes();
  }

  setMeta(params: Params = {}) {
    this.globalService.setTitle(params.text ?? 'Busca');
    if (params && params.text) {
      this.globalService.setMetaDescription(
        `${params.text} e outros diversos produtos no Trokaí. Compre ou venda roupas e acessórios.`,
      );
    } else {
      this.globalService.setMetaDescription(
        'Compre dos melhores brechós com segurança e praticidade.',
      );
    }
  }

  async sortingChanged(ev: { value: string }) {
    this.applyFilters({ ...this.filters, sorting: ev.value } as Filters);
  }

  searchText() {
    this.applyFilters({
      ...this.filters,
      text: this.mobileSearchText,
    } as Filters);
  }

  mountCountString(current: number, total: number) {
    this.countString = null;
    this.pageString = null;

    if (current == 0) {
      this.countString = 'Nenhum resultado ';
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

    // total should be ex: 16 mil instead of 16000

    const totalStr =
      total < 1000 ? total.toString() : `${Math.floor(total / 1000)} mil`;

    this.countString = `${current} de ${totalStr} resultados `;

    const pages = Math.ceil(total / this.limit);
    if (pages == 1) return;

    this.pageString = `Página ${this.activePage + 1} de ${pages}`;
  }

  applyFilters(filters: Filters) {
    filters = new Filters({ ...filters });

    this.router.navigate(['/search'], {
      queryParams: { ...filters.getUrlParams(), page: 1 },
    });
  }

  async showFiltersDialog() {
    const dialogRef = this.matDialog.open(FilterDialogComponent, {
      data: { filter: this.filters },
      panelClass: 'dialog-large',
    });

    const result = await lastValueFrom(dialogRef.afterClosed());
    if (result?.filter) this.applyFilters(result.filter);
  }

  async showSortingDialog() {
    const dialogRef = this.matDialog.open(SortingDialogComponent, {
      data: { sorting: this.filters.sorting },
      panelClass: 'dialog-large',
    });

    const result = await lastValueFrom(dialogRef.afterClosed());
    if (result?.sorting) {
      this.applyFilters({
        ...this.filters,
        sorting: result.sorting,
      } as Filters);
    }
  }

  getSortingString() {
    if (this.filters.sorting == 'cost') return 'Mais baratos';
    if (this.filters.sorting == 'recent') return 'Mais recentes';
    return 'Em destaque';
  }

  async searchClothes() {
    const filters = { ...this.filters };

    try {
      const response = await this.searchService.getClothes(
        filters as Filters,
        this.limit * this.activePage,
        this.limit,
      );

      if (response) {
        if (!this.results) this.results = [];
        this.results = response.clothes;
        this.mountCountString(response.clothes.length, response.count);

        this.paginator = new Paginator(
          this.activePage + 1,
          response.count / this.limit,
        );
      }
    } finally {
      /* intentional */
    }
  }

  ngOnDestroy() {
    // Wrap this so it doesn't interrupt the navigation's stability
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        this.searchPageService.setMainSearchText('');
      });
    } else {
      this.searchPageService.setMainSearchText('');
    }
  }
}
