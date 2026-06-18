import { enableProdMode, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  registerLocaleData,
} from '@angular/common';
import { CanDeactivateGuard } from './app/shared/classes/can-deactivate.guard';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpErrorInterceptor } from './app/shared/classes/http-error.interceptor';
import {
  provideRouter,
  RouteReuseStrategy,
  RouterModule,
} from '@angular/router';
import { provideEnvironmentNgxMask, provideNgxMask } from 'ngx-mask';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { provideLottieOptions } from 'ngx-lottie';
import { routes } from './app/app.routes';
import {
  IonicRouteStrategy,
  IonNav,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import localePt from '@angular/common/locales/pt';
import { FirebaseService } from './app/services/firebase.service';
import {
  AlertService,
  MaterialFeedbackService,
  ShortDatePipe,
} from '@trokai/shared-ui';
import { ToastService } from './app/services/toast-service';
import { NetworkService } from './app/services/network.service';
import {
  APP_CONFIG,
  FeedbackService,
  NavigationManager,
  SearchLocationService,
  StorageService,
  MediaService,
  ConnectivityService,
} from '@trokai/shared-core';
import { MobileMediaService } from './app/services/media.service';
import {
  CheckoutAnalytics,
  CheckoutNavigator,
  CompletingNavigator,
} from '@trokai/shared-data-access';
import { MobileNavigationManager } from './app/core/mobile-navigation.manager';
import { MobileCheckoutNavigator } from './app/core/mobile-buying-platform';
import { MobileStorageService } from './app/core/mobile-storage.service';
import { MobileCompletingNavigator } from './app/core/mobile-completing-navigator';
import { GeolocationService } from './app/services/geolocation.service';


if (environment.production) {
  enableProdMode();
}

registerLocaleData(localePt);

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideAnimationsAsync(),
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      ReactiveFormsModule,
      FormsModule,
      RouterModule,
      CommonModule,
    ),
    DatePipe,
    CanDeactivateGuard,
    // MessagesService,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: NavigationManager, useClass: MobileNavigationManager },
    { provide: SearchLocationService, useExisting: GeolocationService },
    { provide: CheckoutNavigator, useClass: MobileCheckoutNavigator },
    { provide: StorageService, useClass: MobileStorageService },
    { provide: FeedbackService, useClass: MaterialFeedbackService },
    { provide: MediaService, useClass: MobileMediaService },
    { provide: ConnectivityService, useExisting: NetworkService },
    { provide: CompletingNavigator, useClass: MobileCompletingNavigator },
    { provide: CheckoutAnalytics },
    { provide: APP_CONFIG, useValue: environment },
    { provide: ShortDatePipe },
    { provide: CurrencyPipe },
    { provide: AlertService },
    { provide: ToastService },
    FirebaseService,
    provideEnvironmentNgxMask(),
    provideHttpClient(withInterceptorsFromDi()),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ],
}).catch((err) => console.log(err));
