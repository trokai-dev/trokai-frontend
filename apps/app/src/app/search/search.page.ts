import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SearchService } from '../services/search.service';
import { MainService } from '../services/main.service';
import { Keyboard } from '@capacitor/keyboard';
import { Filters, NavbarItem } from '@trokai/shared-core';
import { SearchPageService } from '../services/search-page.service';
import { FilterTagsComponent } from '../shared/components/filter-tags/filter-tags.component';
import {
  SearchRequest,
  TkProductListComponent,
  TkSearchBarComponent,
  TkUserListComponent,
} from '@trokai/shared-features';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonToolbar,
  Platform,
  IonList,
  IonSpinner,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sadOutline } from 'ionicons/icons';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonIcon,
    IonList,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonContent,
    FilterTagsComponent,
    TkSearchBarComponent,
    TkProductListComponent,
    TkUserListComponent,
  ],
})
export class SearchPage implements OnInit {
  private searchService = inject(SearchService);
  private searchPageService = inject(SearchPageService);
  private mainService = inject(MainService);
  private platform = inject(Platform);
  private firebaseService = inject(FirebaseService);

  @ViewChild('content') content: IonContent;

  @ViewChild(IonInfiniteScroll)
  infiniteScroll: IonInfiniteScroll;

  searchText = null; // current search bar text
  lastSearch = null; // last submission search text

  endOfSearch = false;

  target = null;
  results;
  limit = 16;

  menu: NavbarItem[];
  filters: Filters;

  get isLoading() {
    return !this.showInitialPage() && !this.results;
  }

  ngOnInit() {
    addIcons({ sadOutline });

    this.mainService.searchTab.subscribe(
      () => this.content.scrollToTop(400), // rola a pagina ao escolher um item
    );

    this.searchPageService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.checkLink();
    });

    // CHANGE THIS TO USE FROM INIT DATA GLOBAL SERVICE
    this.searchPageService.getMenuCategories().subscribe((res) => {
      const menu = [];

      res.navbar.forEach((item) => {
        if (item.cols[0].label) {
          menu.push(item);
        } else {
          let singleList = [];
          item.cols.forEach(
            (col) => (singleList = singleList.concat(col.list)),
          );

          item.cols = [
            {
              list: singleList,
            },
          ];

          menu.push(item);
        }
      });

      this.menu = menu;
    });
  }

  checkLink() {
    // se veio de um deep link externo (?search=...), preenche o campo de busca e faz a pesquisa
    if (this.searchPageService.homeSearch) {
      this.searchPageService.homeSearch = false; // reseta a flag
      this.target = 'clothes';

      const serviceText = this.searchPageService.getFiltersValue()?.text;
      if (serviceText) this.searchText = serviceText;

      this.preSearch();
      this.searchClothes();
    }
  }

  async loadData(ev) {
    try {
      await (this.target === 'clothes'
        ? this.searchClothes()
        : this.searchUsers());
    } finally {
      ev.target.complete();
    }
  }

  filtersOn() {
    return this.filters?.enabled();
  }

  showInitialPage() {
    // se nao pesquisou, nao tem filtro e nao tem texto, mostra a pagina inicial
    return !this.lastSearch && !this.filtersOn();
  }

  // called after filter component event (app-filter-tags)
  applyFilters(filters: Filters) {
    this.searchPageService.setFilters(filters);
    this.runSearch();
  }

  onSearchTextChange(text: string) {
    this.searchText = text;
  }

  onSearchRequested({ filters, scope }: SearchRequest) {
    const target = scope === 'vendors' ? 'users' : 'clothes';
    if (target !== this.target) this.searchPageService.reset();

    this.target = target;
    this.searchText = filters.text ?? '';
    this.applyFilters(filters);

    this.firebaseService.log(
      target === 'clothes' ? 'PESQUISA_ROUPAS' : 'PESQUISA_USERS',
    );
  }

  preSearch() {
    this.results = null;
    this.lastSearch = this.searchText;
    this.endOfSearch = false;
    this.content?.scrollToTop(300);
  }

  runSearch() {
    if (this.platform.is('mobile') && this.platform.is('hybrid')) {
      Keyboard.setAccessoryBarVisible({ isVisible: false });
      Keyboard.hide();
    }

    if (!this.searchText && !this.filtersOn()) {
      this.searchPageService.reset();
      return;
    }

    if (!this.target) this.target = 'clothes';

    this.preSearch();

    if (this.target === 'clothes') this.searchClothes();
    else this.searchUsers();
  }

  async searchClothes() {
    this.searchPageService.setFilterText(this.searchText);
    const skip = this.results?.length ?? 0;

    try {
      const response = await this.searchService.getClothes(
        this.filters,
        skip,
        this.limit,
      );

      if (response) {
        if (!this.results) this.results = [];
        this.results = this.results.concat(response.clothes);
        this.endOfSearch = response.count <= this.results.length;
      }
    } finally {
      /* intentional */
    }
  }

  async searchUsers() {
    const skip = this.results?.length ?? 0;

    try {
      const response = await this.searchService.getUsers(
        skip,
        this.limit,
        this.searchText,
      );

      if (response) {
        if (!this.results) this.results = [];
        this.results = this.results.concat(response.users);
        this.endOfSearch = response.count <= this.results.length;
      }
    } finally {
      /* intentional */
    }
  }

  openClothe(p) {
    this.firebaseService.log('PESQUISA_ABRIU_ROUPA');
    this.mainService.navigateToProduct(p._id);
  }

  openUser(u) {
    this.firebaseService.log('PESQUISA_ABRIU_USER');
    this.mainService.navigateToWardrobe(u._id);
  }
}
