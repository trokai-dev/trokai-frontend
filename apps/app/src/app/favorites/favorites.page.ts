import { Clothes } from '@trokai/shared-core';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FavoritesService } from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';
import { InventoryService } from '../services/inventory.service';
import { Subscription } from 'rxjs';
import { MainService } from '../services/main.service';

import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { NgStyle } from '@angular/common';
import { TkProductCardComponent } from '@trokai/shared-ui';
import {
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    BackButtonComponent,
    NgStyle,
    TkProductCardComponent,
  ],
})
export class FavoritesPage implements OnInit, OnDestroy {
  private favoritesService = inject(FavoritesService);
  private inventoryService = inject(InventoryService);
  private mainService = inject(MainService);

  constructor() {
    addIcons({ close });
  }

  favorites: Clothes[];
  favoritesBkp: Clothes[];

  url;

  endOfSearch = false;
  removed = [];

  favSub: Subscription;
  favMustChange: Subscription;

  pageActive = false;
  mustUpdate = false;

  get isLoading() {
    return !this.favorites;
  }

  async open(p) {
    this.mainService.navigateToProduct(p._id);
  }

  ngOnInit() {
    this.url = environment.imageURL;

    // usuario favoritou algo nas outras telas
    this.favMustChange = this.favoritesService.favoritesChanged$.subscribe(
      () => {
        if (this.pageActive) return; // nao faz nada se a acao foi aqui
        this.mustUpdate = true; // vai atualizar quando voltar pra tela
      },
    );

    this.fetchFavorites();
  }

  async fetchFavorites() {
    try {
      const response = await this.favoritesService.fetchFavoriteObjects(
        this.favorites?.length ?? 0,
        16,
      );

      if (response) {
        if (!this.favorites) {
          this.favorites = [];
          this.favoritesBkp = [];
        }

        this.favorites = this.favorites.concat([...response.clothes]);
        this.favoritesBkp = this.favoritesBkp.concat([...response.clothes]);
        this.endOfSearch = response.count <= this.favorites?.length;
      }
    } finally {
      /* intentional */
    }
  }

  getLabel(p) {
    let string = '';

    if (p.size !== null && p.size !== '') {
      string += this.inventoryService.getSizeName(p.size, p.category, p.age);
    }

    if (p.distance) {
      string += p.distance;
    }

    return string;
  }

  finishLiking(p: Clothes) {
    if (this.favoritesService.checkFavorite(p._id)) {
      this.favoritesBkp.push(p);
      this.removed = this.removed.filter((i) => i !== p._id);
    } else {
      this.removed.push(p._id);
      this.favoritesBkp = this.favoritesBkp.filter((fav) => fav._id !== p._id);
    }
  }

  async doRefresh(event) {
    this.favoritesService.updateRemoved(this.removed);
    this.favorites = undefined;
    this.favoritesBkp = undefined;

    try {
      await this.fetchFavorites();
    } finally {
      event.target.complete();
    }
  }

  async loadData(event) {
    try {
      await this.fetchFavorites();
    } finally {
      event.target.complete();
    }
  }

  ionViewDidEnter() {
    this.pageActive = true;
    this.checkMustUpdate();
  }

  checkMustUpdate() {
    if (this.mustUpdate) {
      this.mustUpdate = false;
      this.favorites = undefined;
      this.favoritesBkp = undefined;
      this.fetchFavorites();
    }
  }

  ionViewDidLeave() {
    this.pageActive = false;
  }

  ngOnDestroy() {
    if (this.favMustChange) this.favMustChange.unsubscribe();
    if (this.favSub) this.favSub.unsubscribe();
    this.favoritesService.updateRemoved(this.removed);
  }
}
