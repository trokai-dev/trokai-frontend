import { NavbarItem, User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgZone,
  Output,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  inject,
  OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { MatButtonModule } from '@angular/material/button';
import {
  ActivationStart,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { TkUserAvatarComponent, TkBadgeComponent } from '@trokai/shared-ui';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { BuyingService } from '@trokai/shared-data-access';
import { GlobalService } from '../services/global.service';
import { MessagesService } from '@trokai/shared-data-access';
import { NotificationsService } from '@trokai/shared-data-access';
import { SearchPageService } from '../services/search-page.service';
import { navbarLinks } from './navbar-links';
import { NavUserMenuComponent } from './nav-user-menu/nav-user-menu.component';
import { NavUserMenuDialogComponent } from './nav-user-menu-dialog/nav-user-menu-dialog.component';
import { NavExpandedMenuComponent } from './nav-expanded-menu/nav-expanded-menu.component';
import {
  SearchRequest,
  TkReserveTimeComponent,
  TkSearchBarComponent,
  TkSearchDialogComponent,
} from '@trokai/shared-features';

@Component({
  selector: 'app-navbar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TkUserAvatarComponent,
    TkBadgeComponent,
    NavUserMenuComponent,
    NavExpandedMenuComponent,
    TkReserveTimeComponent,
    TkSearchBarComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private buyingService = inject(BuyingService);
  private renderer = inject(Renderer2);
  private searchPageService = inject(SearchPageService);
  private dialog = inject(MatDialog);
  private bpObserver = inject(BreakpointObserver);
  private notificationService = inject(NotificationsService);
  private globalService = inject(GlobalService);
  private messagesService = inject(MessagesService);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  @Input() checkout = false;
  @Input() checkoutOwner?: string;

  @Output() toggleNav = new EventEmitter<void>();
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  hideMenuTimer?: ReturnType<typeof setTimeout>;

  enter = false;
  baskets = 0;

  navMenu!: NavbarItem[];

  notificationCount = 0;
  messageCount = 0;

  navLinks = navbarLinks;

  searchText = '';
  clearNav = false;

  menuTab: number | null = null;

  user?: User;

  isMobile = false;

  showSearch = false;
  buying = false;

  ngOnInit(): void {
    this.searchPageService.mainSearchText$.subscribe(
      (text) => (this.searchText = text),
    );

    this.router.events.subscribe((event) => {
      if (event instanceof ActivationStart) {
        this.clearNav = event.snapshot.data && event.snapshot.data.clearNav;
        this.showSearch = event.snapshot.data && event.snapshot.data.showSearch;
        this.buying = event.snapshot.data && event.snapshot.data.buying;

        if (this.clearNav) this.searchText = '';

        if (isPlatformBrowser(this.platformId)) {
          if (document) {
            const el = document.querySelector('.navbar-collapse');
            if (el) this.renderer.removeClass(el, 'show');
          }
        }
      }

      // Only reset the menu on NavigationEnd, not on every intermediate event
      // (Angular fires ~8-10 router events per navigation, each triggering CD)
      if (event instanceof NavigationEnd) {
        this.menuTab = null;
      }
    });

    this.authService.user$.subscribe((u) => {
      this.user = u;
    });

    // Mobile matches the breakpoint where the hamburger/avatar take over the nav.
    this.ngZone.runOutsideAngular(() => {
      this.bpObserver.observe('(max-width: 1199px)').subscribe((result) => {
        this.ngZone.run(() => (this.isMobile = result.matches));
      });
    });

    this.buyingService.baskets$.subscribe((baskets) => {
      let sum = 0;

      if (baskets) baskets.forEach((b) => (sum += b.products.length));

      this.baskets = sum;
    });

    this.globalService.navbar$.subscribe((nav) => {
      if (nav) this.navMenu = nav;
    });

    this.notificationService.notReadedCount$.subscribe((count) => {
      this.notificationCount = count;
    });

    this.messagesService.notReadCount$.subscribe((count) => {
      this.messageCount = count;
    });
  }

  onSearchTextChange(text: string) {
    this.searchPageService.setMainSearchText(text);
  }

  async openSearchDialog() {
    const dialogRef = this.dialog.open(TkSearchDialogComponent, {
      data: { navMenu: this.navMenu, initialText: this.searchText },
      panelClass: 'dialog-large',
    });

    const request = await lastValueFrom(dialogRef.afterClosed());
    if (request) this.onSearchRequested(request);
  }

  onSearchRequested(request: SearchRequest) {
    this.router.navigate(['/search'], {
      queryParams: {
        ...request.filters.getUrlParams(),
        scope: request.scope,
        page: 1,
      },
    });
  }

  openUserMenu() {
    if (!this.isMobile || !this.user) return;

    this.dialog.open(NavUserMenuDialogComponent, {
      data: {
        user: this.user,
        notificationsCount: this.notificationCount + this.messageCount,
      },
      panelClass: 'dialog-normal',
    });
  }

  showMenu(category: number) {
    clearTimeout(this.hideMenuTimer);
    this.menuTab = category;
  }

  hideMenu(force = false) {
    if (force) {
      this.menuTab = null;
      return;
    }

    // Run outside zone — this 500ms timeout would keep the zone as a pending
    // macrotask every time the user interacts with the nav menu.
    this.ngZone.runOutsideAngular(() => {
      this.hideMenuTimer = setTimeout(
        () =>
          this.ngZone.run(() => {
            this.menuTab = null;
          }),
        500,
      );
    });
  }
}
