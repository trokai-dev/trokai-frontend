import { Clothes } from '@trokai/shared-core';
import { Brand } from '@trokai/shared-core';
import { CategoryModel, ItemsMap } from '@trokai/shared-core';
import {
  mountExpiration as mountExpirationFn,
  mountExpirationWithDate as mountExpirationWithDateFn,
  joinWithCommasAnd as joinWithCommasAndFn,
} from '@trokai/shared-core';
import { CatalogService } from '@trokai/shared-data-access';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';
import { BehaviorSubject, lastValueFrom, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppState } from '@capacitor/app';

import { FaqData, GlobalParams, NavbarItem } from '@trokai/shared-core';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private http = inject(HttpClient);
  private navCtrl = inject(NavController);
  private catalog = inject(CatalogService);

  private _itemsMap = new BehaviorSubject<ItemsMap>(null);
  private _globalParams = new BehaviorSubject<GlobalParams>(null);
  private _clothesAdjusts = new BehaviorSubject<GlobalParams>(null);
  private _brands = new BehaviorSubject<Brand[]>(null);

  public onAppStateChange = new Subject<AppState>();

  public async load() {
    this.fetchInitialData().subscribe();
    this.fetchClothesAdjusts().subscribe();
  }

  private fetchInitialData() {
    return this.http
      .get<{
        itemsMap: ItemsMap;
        params: GlobalParams;
        brands: Brand[];
        navbar: { navbar: NavbarItem[] };
      }>(environment.urlApi + '/init')
      .pipe(
        tap((data) => {
          this._itemsMap.next(data.itemsMap);
          this.catalog.setItemsMap(data.itemsMap);
          this._globalParams.next(data.params);
          this._brands.next(data.brands);
        }),
      );
  }

  public fetchClothesAdjusts() {
    return this.http
      .get<GlobalParams>(environment.urlApi + '/clothes/item-review')
      .pipe(tap((params) => this._clothesAdjusts.next(params)));
  }

  private fetchMobileVersion() {
    return this.http.get<{ mobileVersion: number }>(
      environment.urlApi + '/mobile-version',
    );
  }

  public async checkMobileVersion() {
    const res = await lastValueFrom(this.fetchMobileVersion());

    if (res.mobileVersion <= environment.mobileVersion) return true;

    this.navCtrl.navigateRoot('/blocked/outdated');
  }

  // GETS
  public itemsMap$() {
    return this._itemsMap.asObservable();
  }

  public getItemsMapValue() {
    return this._itemsMap.getValue();
  }

  public getBrandsValue() {
    return this._brands.getValue();
  }

  public clothesAdjusts$() {
    return this._clothesAdjusts.asObservable();
  }

  public params$() {
    return this._globalParams.asObservable();
  }

  public getParamsValue() {
    return this._globalParams.getValue();
  }

  mountExpiration = mountExpirationFn;
  mountExpirationWithDate = mountExpirationWithDateFn;

  mountProductLink(product: Clothes): string {
    let str = product.title.toString().trim().toLowerCase();

    str = str.replace(/[àáâãäå]/g, 'a');
    str = str.replace(/[èéêë]/g, 'e');
    str = str.replace(/[íìïî]/g, 'i');
    str = str.replace(/[óòõôö]/g, 'o');
    str = str.replace(/[úùüû]/g, 'u');
    str = str.replace(/[ç]/g, 'c');
    str = str.replace(/[ñ]/g, 'n');
    str = str.replace(/[^a-z0-9-]/g, '-');
    str = str.replace(/-+/g, '-');
    str = str.replace(/^-|-$/g, '');

    return `/items/${str}-${product._id}`;
  }

  joinWithCommasAnd = joinWithCommasAndFn;

  getFaq(slug: string) {
    return lastValueFrom(
      this.http.get<FaqData>(`${environment.urlApi}/faq/${slug}`),
    );
  }
}
