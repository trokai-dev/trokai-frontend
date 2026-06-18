import {
  APP_ID,
  APP_INITIALIZER,
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  importProvidersFrom,
} from '@angular/core';
import {
  RouterModule,
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import {
  CommonModule,
  CurrencyPipe,
  registerLocaleData,
} from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OAuthModule } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';
import { CustomHttpInterceptor } from './http.interceptor';
import {
  AlertService,
  MaterialFeedbackService,
  ShortDatePipe,
} from '@trokai/shared-ui';
import { BrowserRef } from './services/browser-ref.service';
import { provideNgxMask } from 'ngx-mask';

import localePt from '@angular/common/locales/pt';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import {
  APP_CONFIG,
  FeedbackService,
  NavigationManager,
  StorageService,
} from '@trokai/shared-core';
import {
  CheckoutAnalytics,
  CheckoutNavigator,
  CompletingNavigator,
} from '@trokai/shared-data-access';
import { WebNavigationManager } from './core/web-navigation.manager';
import {
  WebCheckoutAnalytics,
  WebCheckoutNavigator,
} from './core/web-buying-platform';
import { WebStorageService } from './core/web-storage.service';
import { WebCompletingNavigator } from './core/web-completing-navigator';
import { GeolocationService } from './services/geolocation.service';
import {
  SearchLocationService,
  MediaService,
  ConnectivityService,
} from '@trokai/shared-core';
import { WebMediaService } from './services/media.service';
import { initialize } from './app.initializers';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideClientHydration(),
    {
      provide: APP_INITIALIZER,
      useFactory: initialize,
      deps: [GeolocationService],
      multi: true,
    },
    importProvidersFrom(
      BrowserModule,
      // reduce initial material
      MatDialogModule,
      MatBadgeModule,
      MatIconModule,
      MatSnackBarModule,
      MatProgressSpinnerModule,
      MatMenuModule,
      MatButtonModule,
      CommonModule,
      OAuthModule.forRoot(),
      FormsModule,
      RouterModule,
    ),
    { provide: APP_ID, useValue: 'serverApp' },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: NavigationManager, useClass: WebNavigationManager },
    { provide: SearchLocationService, useExisting: GeolocationService },
    { provide: CheckoutNavigator, useClass: WebCheckoutNavigator },
    { provide: StorageService, useClass: WebStorageService },
    { provide: FeedbackService, useClass: MaterialFeedbackService },
    { provide: MediaService, useClass: WebMediaService },
    { provide: CompletingNavigator, useClass: WebCompletingNavigator },
    { provide: CheckoutAnalytics, useClass: WebCheckoutAnalytics },
    { provide: APP_CONFIG, useValue: environment },
    { provide: 'googleTagManagerId', useValue: environment.gtm },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    { provide: AlertService },
    { provide: BrowserRef },
    { provide: ConnectivityService, useExisting: BrowserRef },
    { provide: ShortDatePipe },
    { provide: CurrencyPipe },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimations(),
    provideNgxMask(),
  ],
};
