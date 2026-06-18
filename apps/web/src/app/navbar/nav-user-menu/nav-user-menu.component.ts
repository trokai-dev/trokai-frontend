import { User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  inject,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-nav-user-menu',
  standalone: true,
  imports: [RouterLink, MatMenuModule, MatBadgeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './nav-user-menu.component.html',
  styleUrl: './nav-user-menu.component.scss',
})
export class NavUserMenuComponent {
  private authService = inject(AuthService);

  @Input() user!: User;
  @Input() notificationsCount = 0;

  async logout() {
    this.authService.logout();
  }
}
