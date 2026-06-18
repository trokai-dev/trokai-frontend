import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  DOCUMENT,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  ActivationStart,
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { FavoritesService } from '../favorites/favorites.service';
import { GlobalService } from '../services/global.service';
import { BuyingService } from '@trokai/shared-data-access';
import { CompletingInformationService } from '../services/completing-information.service';
import { GeolocationService } from '../services/geolocation.service';
import { FooterComponent } from '../footer/footer.component';

import { CookiesDialogComponent } from '../cookies-dialog/cookies-dialog.component';
import { TrokaiGtmService } from '../services/trokai-gtm.service';
import { BrowserRef } from '../services/browser-ref.service';
import { MessagesService } from '@trokai/shared-data-access';
import { NotificationsService } from '@trokai/shared-data-access';
import { MarketingService } from '../services/marketing.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AlertService } from '@trokai/shared-ui';
import { LoadingService } from '@trokai/shared-ui';
import { StorageService } from '@trokai/shared-core';

import { HomeService } from '../services/home.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideMenuNav } from '../navbar/side-menu-nav/side-menu-nav.component';
import { DialogService } from '../services/dialog.service';
import { InventoryService } from '../wardrobe/inventory.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    NavbarComponent,
    RouterOutlet,
    RouterModule,
    FooterComponent,
    CookiesDialogComponent,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    SideMenuNav,
  ],
})
export class AppComponent implements OnInit {
  private appRef = inject(ApplicationRef);
  private globalService = inject(GlobalService);
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private trokaiGtmService = inject(TrokaiGtmService);
  private completingInformation = inject(CompletingInformationService);
  private browserRef = inject(BrowserRef);
  private buyingService = inject(BuyingService);
  private locationService = inject(GeolocationService);
  private messagesService = inject(MessagesService);
  private notificationsService = inject(NotificationsService);
  private marketingService = inject(MarketingService);
  private inventoryService = inject(InventoryService);
  private bpObserver = inject(BreakpointObserver);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private loadingService = inject(LoadingService);
  private homeService = inject(HomeService);
  private renderer = inject(Renderer2);
  private dialogService = inject(DialogService);
  private storage = inject(StorageService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private dom = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  title = 'Trokaí';
  wasLogged = false;
  showCookies = false;

  isMobile = false;

  showHeaderAlert = false;
  headerAlert: string | null = null;

  utmSource!: string;
  openedFromApp = false;

  checkedFirstUrl = false;
  hideNav = false;

  isDEV = environment.production === false;
  _stable = false;

  loadedScripts = false;
  loggedStable = false; // to avoid start micro/macro tasks before the app is stable

  @ViewChild(SideMenuNav) navMobileSide!: SideMenuNav;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      /* if micro/macro tasks are started before this check, the app will never be stable
      what would block the hydration and http will always return cache instead of requesting  */
      this.appRef.isStable.subscribe((isStable) => {
        if (isStable) this.onAppStable();

        if (this.isDEV && this._stable !== isStable) {
          this._stable = isStable;
          // console.log('App stability changed:', isStable);
          this.changeDetectorRef.detectChanges();

          if (!isStable) {
            return;

            // 2. Check for pending HTTP or Timers using the browser's native state
            // Angular 17 stores pending tasks here:
            const pendingTasks = (
              this.appRef as unknown as { _pendingTasks?: unknown }
            )._pendingTasks;
            console.log('Pending Tasks Count:', pendingTasks);

            // 3. Inspect the Zone's private state for rogue timers
            const taskState = (
              this.ngZone as unknown as {
                _inner?: { _zoneDelegate?: { _taskCounts?: unknown } };
              }
            )._inner?._zoneDelegate?._taskCounts;
            console.log('Zone Task Counts:', taskState);
            // Look for: macroTask > 0 (Timers) or microTask > 0 (Promises)
          }
        }
      });

      // Check if mobile — run outside zone to avoid keeping app unstable
      this.ngZone.runOutsideAngular(() => {
        this.bpObserver.observe('(max-width: 600px)').subscribe((result) => {
          this.ngZone.run(() => (this.isMobile = result.matches));
        });
      });
    }
    this.globalService.load();
  }

  isStable() {
    return this._stable;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events.subscribe((ev) => {
      // Disable dialogs on some routes (postage label)
      if (ev instanceof ActivationStart) {
        this.hideNav = ev.snapshot.data && ev.snapshot.data.hideNav;
      }

      if (ev instanceof NavigationEnd) {
        let url = this.router.url.split('?')[0];
        if (url === '/') url = '';

        this.utmSource = this.route.snapshot.queryParams['utm_source'];
        this.openedFromApp = this.utmSource === 'app';

        if (!this.checkedFirstUrl) {
          this.checkDialogs();
          this.checkedFirstUrl = true;
        }

        this.updateCanonicalUrl(environment.domain + url);
        this.marketingService.resetScroll();
        this.showHeaderAlert = this.router.url === '/';
      }
    });

    this.authService.logged.subscribe((logged) => {
      if (!logged && this.wasLogged) this.onLogout();
      if (logged) this.onLogin();
      this.wasLogged = !!logged;
    });

    this.authService.autoLogin();
    this.buyingService.loadBasketsStorage();

    this.homeService.homeAlert$.subscribe((alert) =>
      // Run outside zone — this 0ms timeout would create a pending Zone.js
      // macrotask on every homeAlert$ emission and delay app stabilization.
      this.ngZone.runOutsideAngular(() =>
        setTimeout(() =>
          this.ngZone.run(() => (this.headerAlert = alert ?? null)),
        ),
      ),
    );
  }

  async checkDialogs() {
    if (this.openedFromApp || this.hideNav) return;

    if (this.route.snapshot.queryParams['coupon']) {
      this.marketingService.checkCoupon(
        this.route.snapshot.queryParams['coupon'],
      );
      return;
    }

    this.showCookies = !(await this.storage.has('accepted_cookies'));
    if (!this.isMobile || this.showCookies) return;

    this.dialogService.openOpenAppDialog(this.router.url.substring(1));
  }

  updateCanonicalUrl(url: string) {
    const head = this.dom.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null =
      this.dom.querySelector(`link[rel='canonical']`) || null;
    if (element == null) {
      element = this.dom.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute('rel', 'canonical');
    element.setAttribute('href', url);
  }

  async onLogin() {
    this.favoritesService.fetchFavorites().subscribe();
    this.locationService.reset();

    await this.buyingService.getMyReserves();
    this.trokaiGtmService.identifyUser(); // push user data to GTM
    this.completingInformation.next();
  }

  async onAppStable() {
    if (this.authService.isLogged() && !this.loggedStable) {
      this.loggedStable = true;
      this.completingInformation.restoreAction(); // user logou navegando (google) ou recarregou a página
      this.notificationsService.fetchUnreadCount();
      this.messagesService.fetchChats();
    }

    if (environment.production && !this.loadedScripts) {
      this.loadedScripts = true;
      this.browserRef.loadMainScripts();
      this.trokaiGtmService.addGtmToDom();
    }
  }

  async onLogout() {
    this.loggedStable = false;
    this.authService.redirectToLogin();
    this.favoritesService.reset();
    this.buyingService.reset();
    this.completingInformation.reset();
    this.locationService.reset();
    this.messagesService.reset();
    this.notificationsService.reset();
    this.trokaiGtmService.logoutEvent();
    this.inventoryService.reset();
  }

  async checkEmailVerify() {
    try {
      const params = this.route.snapshot.queryParams;
      if (!params || !params['email-verify']) return;
      if (!params['email'] || !params['code']) return;

      await this.globalService.verifyEmail(
        params['email'],
        params['code'].toString(),
      );

      this.alert.showDialog(
        'Email verificado com sucesso!',
        'Você já pode utilizar o Trokaí normalmente.',
      );
      this.router.navigate(['/']);
    } catch {
      this.router.navigate(['/']);
    }
  }

  onDrawerClosed() {
    const container = this.dom.querySelector('mat-drawer-container');
    if (container) {
      this.renderer.removeStyle(container, 'overflow');
      this.renderer.removeStyle(container, 'height');
      this.navMobileSide.menuTab = null;
    }
  }

  onDrawerOpened() {
    // set body overflow hidden
    const container = this.dom.querySelector('mat-drawer-container');
    if (container) {
      this.renderer.setStyle(container, 'overflow', 'hidden');
      this.renderer.setStyle(container, 'height', '100dvh'); // Ensure it takes full screen height
    }
  }

  onAcceptCookies() {
    this.showCookies = false;
  }
}
