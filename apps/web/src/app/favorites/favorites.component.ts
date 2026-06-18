import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { FavoritesService } from './favorites.service';
import { ItemsMap } from '../models/items-map';
import { Clothes } from '@trokai/shared-core';
import { MatButtonModule } from '@angular/material/button';
import { TkProductCardComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [TkProductCardComponent, MatButtonModule, RouterLink],
})
export class FavoritesComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private globalService = inject(GlobalService);

  results: Clothes[] = [];
  itemsMap?: ItemsMap;
  count = 0;

  ngOnInit(): void {
    this.globalService.setTitle('Favoritos');
    this.fetch();
  }

  // paginator bypassed for now — carrega o primeiro lote
  async fetch() {
    const res = await this.favoritesService.fetchFavoriteObjects(0, 32);
    if (!res) return;
    this.results = res.clothes;
    this.count = res.count;
  }
}
