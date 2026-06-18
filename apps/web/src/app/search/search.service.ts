import { User } from '@trokai/shared-core';
import { Clothes } from '@trokai/shared-core';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import {
  CollectionResponse,
  Filters,
  SearchResponse,
  UserSearchResponse,
} from '@trokai/shared-core';
import { GeolocationService } from '../services/geolocation.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private http = inject(HttpClient);
  private locationService = inject(GeolocationService);

  async getUserInfo(userIdOrNick: string) {
    const res = await lastValueFrom(
      this.http.get<User>(environment.urlApi + '/users/' + userIdOrNick, {
        headers: { CacheEnabled: 'true' }, // Custom header to enable caching
      }),
    );

    console.log('User info response:', res); // Log the raw response for debugging

    return new User(res);
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
    exclude: string[] = [],
    cache = false,
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
          headers: cache
            ? { CacheEnabled: 'true' } // Custom header to enable caching
            : {}, // Use the headers object with CacheEnabled if caching is enabled
        },
      ),
    );
  }

  getClothes(
    filters: Filters,
    skip: number,
    limit: number,
  ): Promise<SearchResponse> {
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
        headers: { CacheEnabled: 'true' }, // Custom header to enable caching
      }),
    );
  }

  getUsers(skip = 0, limit = 30, text = '') {
    const searchLocation = this.locationService.getSearchLocationValue();

    const params: {
      skip: number;
      limit: number;
      text: string;
      placeLat?: number;
      placeLng?: number;
    } = {
      skip,
      limit,
      text,
    };

    if (searchLocation) {
      params.placeLat = searchLocation.lat;
      params.placeLng = searchLocation.lng;
    }

    return lastValueFrom(
      this.http.get<UserSearchResponse>(`${environment.urlApi}/users`, {
        params: { ...params },
      }),
    );
  }

  fetchCompleteProduct(productId: string) {
    return this.http.get<{ clothes: Clothes }>(
      `${environment.urlApi}/clothes/${productId}/details`,
    );
  }

  getUserReviews(userId: string) {
    return lastValueFrom(
      this.http
        .get<{ reviews: unknown }>(environment.urlApi + '/users/' + userId + '/reviews')
        .pipe(map((item) => item['reviews'])),
    );
  }

  getCollection(slug: string, skip: number, limit: number) {
    return lastValueFrom(
      this.http.get<CollectionResponse>(
        `${environment.urlApi}/collections/${slug}`,
        {
          params: {
            skip: skip.toString(),
            limit: limit.toString(),
          },
        },
      ),
    );
  }
}
