import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationManager, NavOptions, User } from '@trokai/shared-core';
import { AuthService } from '../auth/auth.service';

/** Web implementation of NavigationManager — Angular Router + browser history. */
@Injectable()
export class WebNavigationManager extends NavigationManager {
  private router = inject(Router);
  private auth = inject(AuthService);

  ensureAuthenticated(): boolean {
    if (this.auth.checkLogged()) return true;
    this.auth.askToLogin();
    return false;
  }

  isAuthenticated(): boolean {
    return this.auth.checkLogged();
  }

  currentUserId(): string | undefined {
    return this.auth.getUserValue()?._id;
  }

  currentUser(): User | undefined | null {
    return this.auth.getUserValue();
  }

  async syncUserData(): Promise<void> {
    await this.auth.syncUserData();
  }

  forward(commands: unknown[], opts?: NavOptions): Promise<boolean> {
    return this.router.navigate(commands as unknown[], {
      queryParams: opts?.queryParams,
      replaceUrl: opts?.replaceUrl,
    });
  }

  async back(): Promise<void> {
    history.back();
  }

  root(commands: unknown[], opts?: NavOptions): Promise<boolean> {
    return this.router.navigate(commands as unknown[], {
      queryParams: opts?.queryParams,
      replaceUrl: true,
    });
  }

  registerHardwareBack(): void {
    // No hardware back button on the web.
  }
}
