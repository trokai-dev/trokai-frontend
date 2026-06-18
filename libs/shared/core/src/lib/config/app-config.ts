import { InjectionToken } from '@angular/core';

// env subset shared services need
export interface AppConfig {
  urlApi: string;
  imageURL: string;
  defaultAvatar: string;
  mapsGeocodingKey?: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
