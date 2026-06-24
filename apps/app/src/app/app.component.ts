import { User } from '@trokai/shared-core';
import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { lastValueFrom } from 'rxjs';
import { UserService } from '@trokai/shared-data-access';
import { SearchService } from './services/search.service';
import { NotificationsService } from '@trokai/shared-data-access';
import { App, AppState, URLOpenListenerEvent } from '@capacitor/app';
import { FavoritesService } from '@trokai/shared-data-access';
import { BuyingService } from '@trokai/shared-data-access';
import { MainService } from './services/main.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { register } from 'swiper/element/bundle';
import { MessagesService } from '@trokai/shared-data-access';
import { SearchPageService } from './services/search-page.service';
import { AlertService } from '@trokai/shared-ui';
import { FirebaseService } from './services/firebase.service';
import { GeolocationService } from './services/geolocation.service';
import { GlobalService } from './services/global.service';
import { NetworkService } from './services/network.service';
import { ToastService } from './services/toast-service';
import {
  LoadingController,
  NavController,
  Platform,
  IonApp,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/push-notifications.service';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { environment } from 'src/environments/environment';
import { CompletingInformationService } from '@trokai/shared-data-access';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonRouterOutlet, IonApp],
})
export class AppComponent implements OnInit, OnDestroy {
  deepLinksTrying = 0;
  wasLogged = false;

  _user: User;
  openNotifications = false;

  private platform = inject(Platform);
  private searchService = inject(SearchService);
  private searchPageService = inject(SearchPageService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private navController = inject(NavController);
  private router = inject(Router);
  private notificationService = inject(NotificationsService);
  private networkService = inject(NetworkService);
  private toastService = inject(ToastService);
  private locationService = inject(GeolocationService);
  private favoritesService = inject(FavoritesService);
  private buyingService = inject(BuyingService);
  private globalService = inject(GlobalService);
  private mainService = inject(MainService);
  private alertService = inject(AlertService);
  private firebaseService = inject(FirebaseService);
  private loadingCtrl = inject(LoadingController);
  private messagesService = inject(MessagesService);
  private pushService = inject(PushNotificationsService);
  private zone = inject(NgZone);
  private completingInfoService = inject(CompletingInformationService);

  ngOnInit() {
    this.start();
  }

  async verifyEmailLink(path) {
    try {
      const parametros = path.split('&');

      const body = new Object();

      parametros.forEach((string) => {
        const chaveValor = string.split('=');
        body[chaveValor[0]] = chaveValor[1];
      });

      if (body['email-verify'] && body['email'] && body['code'] != null) {
        delete body['email-verify'];
        body['token'] = body['code'];
        delete body['code'];
        await this.userService.verifyEmail(body);
        this.alertService.showSuccess('Email verificado!', '');
      }
    } catch {
      /* intentional */
    }
  }

  async start() {
    this.locationService.reset();

    // verifica se o app esta na versao minima
    const appOnDate = await this.globalService.checkMobileVersion();
    if (!appOnDate) return;

    this.globalService.load();
    this.networkService.start();

    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) this.startMobile();
      else this.firebaseService.initialize();
    });

    this.router.events.subscribe((r) => {
      if (r instanceof NavigationEnd)
        this.firebaseService.setScreen(r.url, r.url);
    });

    this.authService.logged$.subscribe((logged) => {
      if (!logged && this.wasLogged) this.onLogout();
      if (logged) this.onLogin();
      this.wasLogged = logged;
    });

    await SocialLogin.initialize({
      google: {
        webClientId: environment.googleAuth.webClientId,
        iOSClientId: environment.googleAuth.iosClientId,
      },
    });

    this.autoLogin();
    this.buyingService.loadBasketsStorage();
  }

  async startMobile() {
    this.pushService.registered$.subscribe(() =>
      this.checkPushUserAssociation(),
    );

    // capacitor listeners
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        if (event.url.includes('email-verify')) {
          this.verifyEmailLink(event.url.split('?').pop());
        } else {
          // parse scheme from to url
          if (event.url.startsWith('trokai://')) {
            event.url = event.url.replace(
              'trokai://',
              'https://www.trokai.com.br/',
            );
          }
          this.mainService.processLink(new URL(event.url));
        }
      });
    });

    App.addListener('appStateChange', this.onAppStageChange.bind(this));

    this.pushService.pushAction$.subscribe(() => {
      if (this.wasLogged) this.router.navigateByUrl('/main/home');
      else this.openNotifications = true;
    });

    this.pushService.pushReceived$.subscribe(() => this.onPushReceived());

    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setStyle({ style: Style.Light });
    StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    await this.pushService.start();
  }

  async onPushReceived() {
    if (this.authService.isLogged()) {
      this.notificationService.fetchUnreadCount();
      await this.messagesService.fetchChats();
    }
  }

  onLogout() {
    this.navController.navigateRoot('/main/auth');
    this.searchPageService.reset();
    this.notificationService.reset();
    this.locationService.reset();
    this.favoritesService.reset();
    this.buyingService.reset();
    this.messagesService.reset();
    this.completingInfoService.reset();
  }

  /**
   * 3 cases:
   * - user is logged and push is registered
   * - user is logged and push is not registered
   * - user is not logged and push is registered
   */
  checkPushUserAssociation() {
    if (this.authService.isLogged() && this.pushService.isRegistered())
      this.pushService.userAssociate();
  }

  async onLogin() {
    const user = this.authService.getUserValue();

    // set user do firebase analytics
    if (user && user._id) this.firebaseService.setUser(user._id);

    this.notificationService.fetchUnreadCount();
    this.favoritesService.fetchFavorites().subscribe();
    this.locationService.reset();

    await this.buyingService.getMyReserves();
    if (this.openNotifications) this.router.navigateByUrl('/main/home');

    this.authService.checkUserTokens();
    this.messagesService.fetchChats();

    this.checkPushUserAssociation();

    this.completingInfoService.next();
  }

  async autoLogin() {
    await lastValueFrom(this.authService.autoLogin());
  }

  ngOnDestroy() {
    this.networkService.stop();
  }

  private onAppStageChange(state: AppState) {
    this.globalService.onAppStateChange.next(state);

    if (state.isActive && this.authService.isLogged()) {
      this.notificationService.fetchUnreadCount();
      this.messagesService.fetchChats();
    }
  }
}
