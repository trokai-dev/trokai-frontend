import { User } from '@trokai/shared-core';
import { Clothes } from '@trokai/shared-core';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Filters, SearchResponse, UserSearchResponse } from '@trokai/shared-core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { GeolocationService } from './geolocation.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private http = inject(HttpClient);
  private locationService = inject(GeolocationService);

  getUserInfo(userIdOrNick) {
    return lastValueFrom(
      this.http.get<User>(environment.urlApi + '/users/' + userIdOrNick),
    );
  }

  /**
   *
   * @param userId product owner id
   * @param skip
   * @param limit
   * @param filter filter to apply
   * @param excludeIds products ids to exclude
   * @returns
   */
  getClothesOfUser(
    userId: string,
    skip: number,
    limit: number,
    filter?: Filters,
    exclude = [],
  ) {
    return lastValueFrom(
      this.http.get<SearchResponse>(
        environment.urlApi + '/products/users/' + userId,
        {
          params: {
            skip,
            limit,
            ...filter,
            exclude: exclude.join(','),
          },
        },
      ),
    );
  }

  getClothes(filters: Filters, skip?, limit?): Promise<SearchResponse> {
    filters = new Filters(filters); // create a new instance to avoid mutating the original one

    const searchLocation = this.locationService.getSearchLocationValue();

    if (searchLocation) {
      filters.placeLat = searchLocation.lat;
      filters.placeLng = searchLocation.lng;
    }

    if (filters.text == null) delete filters.text;

    return lastValueFrom(
      this.http.get<SearchResponse>(environment.urlApi + '/products', {
        params: {
          skip,
          limit,
          ...filters,
        },
      }),
    );
  }

  getUsers(skip?, limit?, text?) {
    const searchLocation = this.locationService.getSearchLocationValue();

    const params = {
      skip,
      limit,
      text,
    };

    if (searchLocation) {
      params['placeLat'] = searchLocation.lat;
      params['placeLng'] = searchLocation.lng;
    }

    return lastValueFrom(
      this.http.get<UserSearchResponse>(`${environment.urlApi}/users`, {
        params: params,
      }),
    );
  }

  fetchCompleteProduct(productId: string) {
    return this.http.get<{ clothes: Clothes }>(
      `${environment.urlApi}/clothes/${productId}/details`,
    );
  }
}
