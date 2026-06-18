import { NavbarItem, User } from '@trokai/shared-core';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';

import { NavbarLink, navbarLinks } from '../navbar-links';
import { Router } from '@angular/router';

import { NavExpandedMenuComponent } from '../nav-expanded-menu/nav-expanded-menu.component';
import { GlobalService } from 'src/app/services/global.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-side-menu-nav',
  standalone: true,
  imports: [
    NavExpandedMenuComponent,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './side-menu-nav.component.html',
  styleUrl: './side-menu-nav.component.scss',
})
export class SideMenuNav implements OnInit {
  private router = inject(Router);
  private globalService = inject(GlobalService);
  private authService = inject(AuthService);

  @Output() menuClose = new EventEmitter<void>();

  menuTab: number | null = null;
  navMenu!: NavbarItem[];
  navLinks = navbarLinks;

  user?: User;

  ngOnInit(): void {
    this.globalService.navbar.subscribe((nav) => {
      if (nav) this.navMenu = nav;
    });
    this.authService.user.subscribe((user) => (this.user = user));
  }

  onClickBack() {
    this.menuTab = null;
  }

  onClickSimple(route: string) {
    this.router.navigate([route]);
    this.menuClose.emit();
  }

  onClickLink(link: NavbarLink) {
    // navigate
    if (!link.expandable && link.route) {
      this.menuClose.emit();

      this.router.navigate([link.route], {
        queryParams: link.queryParams,
      });

      this.menuTab = null;

      return;
    }

    // expand
    if (link.expandable) {
      this.menuTab = link.menuIndex ?? null;
    }
  }
}
