import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import { HomePayloadRow } from '@trokai/shared-core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { PreloadService } from './preload.service';
import { GeolocationService } from './geolocation.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http = inject(HttpClient);
  private preloadService = inject(PreloadService);
  private geolocationService = inject(GeolocationService);

  homeAlert$ = new BehaviorSubject<string | undefined>(undefined);

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
      this.http
        .get<{
          home: HomePayloadRow[];
          alert?: string;
          ratings?: [];
          updatedAt: Date;
        }>(`${environment.urlApi}/home`, {
          headers: { CacheEnabled: 'true' }, // Custom header to enable caching
          params,
        })
        .pipe(
          tap((r) => {
            // Preload first banner
            const firstRow = r.home[0];

            if (firstRow.objectType === 'banner') {
              const item = firstRow.items?.[0];

              if (item?.imgMobileUrl && item?.imgUrl)
                this.preloadService.preloadMobileAndDesk(
                  item.imgMobileUrl,
                  item.imgUrl,
                );
            }

            this.homeAlert$.next(r.alert);
          }),
        ),
    );
  }
}
