import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private httpClient = inject(HttpClient);

  banner = null;

  getBannerInfo() {
    return this.httpClient.get(environment.urlApi + '/banner/all');
  }
}
