import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { LoadingController, Platform } from '@ionic/angular/standalone';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast-service';

import {
  RespostaCep,
  SearchLocation,
  StorageService,
} from '@trokai/shared-core';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private http = inject(HttpClient);
  private platform = inject(Platform);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private storage = inject(StorageService);

  private _searchLocation = new BehaviorSubject<SearchLocation | null>(null);
  private _user;

  get searchLocation$() {
    return this._searchLocation.asObservable();
  }

  constructor() {
    this.authService.user$.subscribe((u) => {
      if (!u) return;

      if (
        u &&
        u.address &&
        this._user &&
        (!this._user ||
          !this._user.address ||
          (this._user.address &&
            this._user.address.zipCode !== u.address.zipCode))
      )
        // se o usuario tiver um endereco e for diferente do endereco atual, atualiza a localizacao de busca
        this.setSearchLocation(
          u.address.location.coordinates[1],
          u.address.location.coordinates[0],
          u.address.zipCode,
        );

      this._user = u;
    });
  }

  // private methods

  private async getAddressFromLatLng(lat, lng) {
    return lastValueFrom(
      this.http
        .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}
    &key=${environment.mapsGeocodingKey}&result_type=street_address`),
    );
  }

  private async getLatLngFromCep(cep: number) {
    return lastValueFrom(
      this.http.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}
      &components=country:BR&key=${environment.mapsGeocodingKey}`,
      ),
    );
  }

  private async checkGpsPermission(): Promise<boolean> {
    if (!(this.platform.is('mobile') && this.platform.is('hybrid'))) {
      this.toastService.makeToast('Sem permissão para localização');
      return false;
    }

    // verifica permissao de gps
    let permissions = await Geolocation.checkPermissions();

    // se nao tiver permissao, solicita permissao
    if (permissions.location !== 'granted')
      permissions = await Geolocation.requestPermissions();

    // se permissao aceita
    if (permissions.location === 'granted') return true;

    this.toastService.makeToast('Sem permissão para localização');
    return false;
  }

  private async getGpsCoordinates(): Promise<SearchLocation> {
    try {
      const coordinates = await Geolocation.getCurrentPosition();

      return new SearchLocation(
        coordinates.coords.latitude,
        coordinates.coords.longitude,
      );
    } catch {
      return null;
    }
  }

  private async setSearchLocation(lat: number, lng: number, zip: number) {
    const newLocation = new SearchLocation(lat, lng, zip);
    this._searchLocation.next(newLocation);

    await this.storage.setObject('searchLocation', newLocation);
  }

  private async getStoredSearchLocation(): Promise<SearchLocation> {
    return this.storage.getObject<SearchLocation>('searchLocation');
  }

  // public methods

  public async init() {
    try {
      const user = this.authService.getUserValue();

      // home address
      if (user && user.address) {
        const lat = user.address.location.coordinates[1];
        const lng = user.address.location.coordinates[0];
        const zip = user.address.zipCode;
        await this.setSearchLocation(lat, lng, zip);
        return;
      }

      // check storage for last search location
      const storedLocation = await this.getStoredSearchLocation();

      // if there is a stored location, use it
      if (storedLocation) {
        await this.setSearchLocation(
          storedLocation.lat,
          storedLocation.lng,
          storedLocation.zip,
        );
        return;
      }

      // GPS
      if (await this.checkGpsPermission()) {
        const gpsLocation = await this.getGpsCoordinates();

        if (gpsLocation) {
          const res: any = await this.getAddressFromLatLng(
            gpsLocation.lat,
            gpsLocation.lng,
          );

          const zip =
            +res.results[0].address_components[6].short_name.replace('-');

          await this.setSearchLocation(gpsLocation.lat, gpsLocation.lng, zip);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async getAddressFromZip(zipCode): Promise<RespostaCep> {
    return lastValueFrom(
      this.http.get<RespostaCep>(`https://viacep.com.br/ws/${zipCode}/json/`),
    );
  }

  public async changeSearchZip(zipCode: number) {
    try {
      const res: any = await this.getLatLngFromCep(zipCode);

      if (res.results.length === 0) {
        this.toastService.makeToast('CEP não encontrado');
        return;
      }

      const lat = res.results[0].geometry.location.lat;
      const lng = res.results[0].geometry.location.lng;

      await this.setSearchLocation(lat, lng, zipCode);
    } catch (error) {
      console.log(error);
      this.toastService.makeToast('Erro ao buscar CEP');
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
