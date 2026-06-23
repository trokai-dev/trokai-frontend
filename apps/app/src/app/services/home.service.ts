import { HomePayloadRow, HomePayloadRowItem } from '@trokai/shared-core';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { SearchService } from './search.service';
import { Browser } from '@capacitor/browser';
import { SearchPageService } from './search-page.service';
import { MainService } from './main.service';
import { GeolocationService } from './geolocation.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http = inject(HttpClient);
  private mainService = inject(MainService);
  private geolocationService = inject(GeolocationService);

  fetchHome() {
    const searchLocation = this.geolocationService.getSearchLocationValue();

    let params = {};

    if (searchLocation) {
      params = {
        placeLat: searchLocation.lat,
        placeLng: searchLocation.lng,
      };
    }

    return lastValueFrom(
      this.http.get<{ home: HomePayloadRow[]; alert: string; updatedAt: Date }>(
        `${environment.urlApi}/home`,
        { params },
      ),
    );
  }

  async navigate(item: HomePayloadRow | HomePayloadRowItem) {
    if (!item.actionUrl) return;

    const urlObj = new URL(item.actionUrl);

    if (urlObj.hostname.includes('trokai.com')) {
      this.mainService.processLink(urlObj, item.actionUrl);
    } else {
      Browser.open({ url: item.actionUrl });
    }
  }
}
