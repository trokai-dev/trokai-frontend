import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchLocation } from '../models/geolocation';

@Injectable()
export abstract class SearchLocationService {
  abstract searchLocation: Observable<SearchLocation | null>;
  abstract getSearchLocationValue(): SearchLocation | null;
  abstract changeSearchZip(zip: number): void;
}
