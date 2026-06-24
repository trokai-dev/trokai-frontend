import { User } from '@trokai/shared-core';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TkBadgeComponent, TkSellerStatusBadgeComponent } from '@trokai/shared-ui';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-nav-user-menu-dialog',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterLink,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TkBadgeComponent,
    TkSellerStatusBadgeComponent,
  ],
  templateUrl: './nav-user-menu-dialog.component.html',
  styleUrl: './nav-user-menu-dialog.component.scss',
})
export class NavUserMenuDialogComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<NavUserMenuDialogComponent>);

  data = inject<{ user: User; notificationsCount: number }>(MAT_DIALOG_DATA);

  get user() {
    return this.data.user;
  }

  get notificationsCount() {
    return this.data.notificationsCount;
  }

  goToSellerStatus() {
    this.dialogRef.close();
    this.router.navigateByUrl('/account/seller-status');
  }

  logout() {
    this.authService.logout();
    this.dialogRef.close();
  }
}
