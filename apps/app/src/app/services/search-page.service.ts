import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Filters, NavbarItem } from '@trokai/shared-core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { GeolocationService } from './geolocation.service';

@Injectable({
  providedIn: 'root',
})
export class SearchPageService {
  private locationService = inject(GeolocationService);
  private http = inject(HttpClient);

  homeSearch = false;

  private _filters = new BehaviorSubject<Filters>(new Filters());

  constructor() {
    this.locationService.searchLocation$.subscribe(() => this.reset());
  }

  get filters$() {
    return this._filters.asObservable();
  }

  getFiltersValue(): Filters {
    const f = this._filters.getValue();
    return new Filters(f);
  }

  reset() {
    this.clearFilters();
  }

  clearFilters() {
    this._filters.next(new Filters());
  }

  filtersOn() {
    return this._filters.getValue().enabled();
  }

  getMenuCategories() {
    return this.http.get<{ navbar: NavbarItem[] }>(
      environment.urlApi + '/navbar',
    );
  }

  setFilters(params: Filters) {
    this._filters.next(new Filters(params));
  }

  setFilterText(text: string) {
    const f = this.getFiltersValue();
    f.text = text;
    this.setFilters(f);
  }
}
