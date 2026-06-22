import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG, Clothes, NavigationManager } from '@trokai/shared-core';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;
  private nav = inject(NavigationManager);

  private _favoritesIds = new BehaviorSubject<string[]>([]);
  /** emits após toggle — telas escutam pra atualizar listas */
  readonly favoritesChanged$ = new Subject<void>();

  get favorites() {
    return this._favoritesIds.asObservable();
  }

  get favoriteIds(): string[] {
    return this._favoritesIds.getValue();
  }

  fetchFavorites() {
    return this.http
      .get<string[]>(`${this.urlApi}/favorites-ids`)
      .pipe(tap((r) => this._favoritesIds.next(r ?? [])));
  }

  async clickFavorite(productId: string) {
    if (!this.nav.ensureAuthenticated()) return;

    try {
      if (!this.checkFavorite(productId)) await this.favorite(productId);
      else await this.removeFavorite(productId);
      this.favoritesChanged$.next();
      // eslint-disable-next-line no-empty
    } catch {}
  }

  async favorite(productId: string) {
    await lastValueFrom(
      this.http.post(`${this.urlApi}/favorites/add/`, { itemId: productId }),
    );
    this._favoritesIds.next([...this.favoriteIds, productId]);
  }

  async removeFavorite(productId: string) {
    await lastValueFrom(
      this.http.post(`${this.urlApi}/favorites/remove/`, { itemId: productId }),
    );
    this._favoritesIds.next(
      this.favoriteIds.filter(
        (id) => id.toString().trim() !== productId.toString().trim(),
      ),
    );
  }

  updateRemoved(removedItems: string[]) {
    this._favoritesIds.next(
      this.favoriteIds.filter((id) => !removedItems.includes(id)),
    );
  }

  fetchFavoriteObjects(skip = 0, limit = 10) {
    return lastValueFrom(
      this.http.get<{ clothes: Clothes[]; count: number }>(
        `${this.urlApi}/favorites/v2`,
        { params: { skip, limit } },
      ),
    );
  }

  checkFavorite(productId: string) {
    return this.favoriteIds.some((id) => id === productId);
  }

  reset() {
    this._favoritesIds.next([]);
  }
}
