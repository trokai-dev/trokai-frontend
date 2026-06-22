import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SearchService } from '../services/search.service';
import { MainService } from '../services/main.service';
import { Keyboard } from '@capacitor/keyboard';
import { Filters, NavbarItem } from '@trokai/shared-core';
import { SearchPageService } from '../services/search-page.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { FilterTagsComponent } from '../shared/components/filter-tags/filter-tags.component';
import { TkProductCardComponent } from '@trokai/shared-ui';
import { TkUserCardComponent } from '@trokai/shared-ui';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonToolbar,
  Platform,
  IonSearchbar,
  IonRippleEffect,
  IonList,
  IonSpinner,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import {
  sadOutline,
  search,
  shirtOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,

    IonSearchbar,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonRippleEffect,
    IonList,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonContent,
    FormsModule,
    IonSearchbar,
    FilterTagsComponent,
    NgClass,
    TkProductCardComponent,
    TkUserCardComponent,
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

  searchText = null; // current search text
  lastSearch = null; // last submission search text

  endOfSearch = false;

  target = null;
  results;
  limit = 16;

  menu: NavbarItem[];
  activeMenuTab = 0;
  filters: Filters;

  get isLoading() {
    return !this.showInitialPage() && !this.results;
  }

  ngOnInit() {
    addIcons({ search, shirtOutline, storefrontOutline, sadOutline });

    this.mainService.searchTab.subscribe(
      () => this.content.scrollToTop(400), // rola a pagina ao escolher um item
    );

    this.searchPageService.filters.subscribe((filters) => {
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
    // se veio da home, preenche o campo de busca e faz a pesquisa
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

  // called after filter component event
  applyFilters(filters: Filters) {
    this.searchPageService.setFilters(filters);
    this.enter();
  }

  preSearch() {
    this.results = null;
    this.lastSearch = this.searchText;
    this.endOfSearch = false;
    this.content?.scrollToTop(300);
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

  // SEARCH BAR
  enter(event?) {
    if (event && event.key !== 'Enter') return;

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

  clearSearchText() {
    this.searchPageService.reset();
    this.searchText = null;
    this.lastSearch = null;
  }

  clickSuggestion(target) {
    if (target != this.target) this.searchPageService.reset();
    this.target = target;

    this.preSearch();

    if (target === 'clothes') {
      this.searchClothes();
      this.firebaseService.log('PESQUISA_ROUPAS');
    }
    if (target === 'users') {
      this.searchUsers();
      this.firebaseService.log('PESQUISA_USERS');
    }
  }

  changeText() {
    if (
      (this.searchText === '' || this.searchText === null) &&
      !this.filtersOn()
    ) {
      this.target = null;
      this.lastSearch = null;
    }
  }

  selectInitialCat(cat) {
    this.searchPageService.reset();
    this.preSearch();

    const parsed = JSON.parse(JSON.stringify(cat)); // deep copy

    this.searchPageService.setFilters(parsed.params);
    this.searchText = parsed.params.text;
    this.lastSearch = parsed.params.text;
    this.target = 'clothes';
    this.searchClothes();
    this.firebaseService.log('PESQUISA_SUGESTAO_CATEGORIA', {
      cat: parsed.name,
    });
  }
}
