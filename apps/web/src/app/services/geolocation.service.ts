import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { AlertService } from '@trokai/shared-ui';
import { BrowserRef } from './browser-ref.service';
import { CookiesService } from './cookies.service';

import { RespostaCep, SearchLocation } from '@trokai/shared-core';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private http = inject(HttpClient);
  private browserRef = inject(BrowserRef);
  private alert = inject(AlertService);
  private authService = inject(AuthService);
  private cookiesService = inject(CookiesService);
  private platformId = inject(PLATFORM_ID);

  private readonly COOKIE_KEY = 'search_location';
  private readonly SEARCH_LOCATION_CHANGED = 'search_location_changed';
  private readonly BROADCAST_CHANNEL_NAME = 'search_location_update';

  private _searchLocation = new BehaviorSubject<SearchLocation | null>(null);
  private _addressChannel: BroadcastChannel | null = null;

  // Controla os enderecos disponiveis
  constructor() {
    // se o usuario alterar seu endereco
    this.authService.addressUpdated$.subscribe(() => {
      const u = this.authService.getUserValue();

      console.log('Address updated, refreshing search location', u?.address);

      if (!u?.address?.location || u.address.zipCode == null) return;

      this.setSearchLocation(
        u.address.location.coordinates[1],
        u.address.location.coordinates[0],
        +u.address.zipCode,
        true,
      );
    });

    // 2. Listen for changes from other tabs (browser only)
    if (isPlatformBrowser(this.platformId)) {
      this._addressChannel = new BroadcastChannel(this.BROADCAST_CHANNEL_NAME);
      this._addressChannel.onmessage = (event) => {
        if (event.data.type === this.SEARCH_LOCATION_CHANGED) {
          const newLocation = event.data.data as SearchLocation;
          this.setSearchLocation(
            newLocation.lat,
            newLocation.lng,
            newLocation.zip,
          );
        }
      };
    }
  }

  get searchLocation$() {
    return this._searchLocation.asObservable();
  }

  // private methods
  private async getLatLngFromCep(cep: number) {
    return lastValueFrom(
      this.http.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}
      &components=country:BR&key=${environment.mapsGeocodingKey}`,
      ),
    );
  }

  private async setSearchLocation(
    lat: number,
    lng: number,
    zip: number,
    broadcast = false,
  ) {
    const newLocation = new SearchLocation(lat, lng, zip);
    this._searchLocation.next(newLocation);

    this.cookiesService.set(this.COOKIE_KEY, newLocation);

    if (broadcast && this._addressChannel) {
      this._addressChannel.postMessage({
        type: this.SEARCH_LOCATION_CHANGED,
        data: newLocation,
      });
    }
  }

  private getCookieSearchLocation(): SearchLocation | null {
    return this.cookiesService.get<SearchLocation>(this.COOKIE_KEY);
  }

  // public methods
  public async init() {
    try {
      // check storage for last search location
      const sessionLocation = this.getCookieSearchLocation();

      // if there is a stored location, use it
      if (sessionLocation) {
        await this.setSearchLocation(
          sessionLocation.lat,
          sessionLocation.lng,
          sessionLocation.zip,
        );
        return;
      }

      const user = this.authService.getUserValue();

      // home address
      if (user && user.address?.location && user.address.zipCode != null) {
        const lat = user.address.location.coordinates[1];
        const lng = user.address.location.coordinates[0];
        const zip = +user.address.zipCode;
        await this.setSearchLocation(lat, lng, zip);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async getAddressFromZip(
    zipCode: string | number,
  ): Promise<RespostaCep> {
    return lastValueFrom(
      this.http.get<RespostaCep>(`https://viacep.com.br/ws/${zipCode}/json/`),
    );
  }

  public async changeSearchZip(zipCode: number) {
    try {
      const res = (await this.getLatLngFromCep(zipCode)) as {
        results: { geometry: { location: { lat: number; lng: number } } }[];
      };

      if (res.results.length === 0) {
        this.alert.alert('CEP não encontrado');
        return;
      }

      const lat = res.results[0].geometry.location.lat;
      const lng = res.results[0].geometry.location.lng;

      await this.setSearchLocation(lat, lng, zipCode, true);
    } catch (error) {
      console.log(error);
    }
  }

  public getSearchLocationValue(): SearchLocation | null {
    return this._searchLocation.getValue();
  }

  public reset() {
    this._searchLocation.next(null);
    this.init();
  }
}
