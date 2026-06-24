import { NavbarItem, User } from '@trokai/shared-core';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-nav-expanded-menu',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, TitleCasePipe],
  templateUrl: './nav-expanded-menu.component.html',
  styleUrl: './nav-expanded-menu.component.scss',
})
export class NavExpandedMenuComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  @Input() navMenu!: NavbarItem[];
  @Input() menuTab: number | null = null;
  @Input() mobile = false;

  @Output() hideMenu = new EventEmitter<void>();
  @Output() showMenu = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  hideMenuTimer?: ReturnType<typeof setTimeout>;

  brechosTransformed = false;
  user?: User;

  ngOnInit() {
    this.authService.user$.subscribe((user) => (this.user = user));

    // deep copy
    this.navMenu = JSON.parse(JSON.stringify(this.navMenu));

    if (this.mobile) this.transformBrechos();
  }

  transformBrechos() {
    try {
      const allBrechos = [
        ...this.navMenu[2].cols[0].list,
        ...this.navMenu[2].cols[1].list,
        ...this.navMenu[2].cols[2].list,
      ];

      const brechos: (typeof allBrechos)[] = [[], []];
      const length = allBrechos.length;
      const half = Math.ceil(length / 2);

      for (let i = 0; i < length; i++)
        brechos[i < half ? 0 : 1].push(allBrechos[i]);

      this.navMenu[2].cols[0].list = brechos[0];
      this.navMenu[2].cols[1].list = brechos[1];
      this.navMenu[2].cols.pop();

      this.brechosTransformed = true;
    } catch {
      /* intentional */
    }
  }

  navigate(route: string, params?: Record<string, unknown>) {
    this.hideMenu.emit();
    this.router.navigate([route], {
      queryParams: params,
    });
  }
}
