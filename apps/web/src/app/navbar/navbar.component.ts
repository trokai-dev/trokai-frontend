import { NavbarItem, User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  ActivationStart,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { TkUserAvatarComponent, TkBadgeComponent } from '@trokai/shared-ui';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';
import { BuyingService } from '@trokai/shared-data-access';
import { GlobalService } from '../services/global.service';
import { MessagesService } from '@trokai/shared-data-access';
import { NotificationsService } from '@trokai/shared-data-access';
import { SearchPageService } from '../services/search-page.service';
import { navbarLinks } from './navbar-links';
import { NavUserMenuComponent } from './nav-user-menu/nav-user-menu.component';
import { NavExpandedMenuComponent } from './nav-expanded-menu/nav-expanded-menu.component';
import { TkReserveTimeComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-navbar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatMenuModule,
    TkUserAvatarComponent,
    TkBadgeComponent,
    NavUserMenuComponent,
    NavExpandedMenuComponent,
    TkReserveTimeComponent,
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
  private notificationService = inject(NotificationsService);
  private globalService = inject(GlobalService);
  private messagesService = inject(MessagesService);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  @Input() checkout = false;
  @Input() checkoutOwner?: string;

  @Output() toggleNav = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef;
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

  search() {
    if (this.searchText && this.searchText.trim().length > 0)
      this.router.navigate(['/search'], {
        queryParams: { text: this.searchText.trim(), page: 1 },
      });
    else this.router.navigate(['/search'], { queryParams: { page: 1 } });

    this.searchInput.nativeElement.blur();
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
