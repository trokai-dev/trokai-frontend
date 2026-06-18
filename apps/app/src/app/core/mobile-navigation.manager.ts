import { inject, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { NavigationManager, NavOptions, User } from '@trokai/shared-core';
import { AuthService } from '../services/auth.service';

/** Mobile implementation of NavigationManager — Ionic NavController stacks + Capacitor hardware back. */
@Injectable()
export class MobileNavigationManager extends NavigationManager {
  private nav = inject(NavController);
  private auth = inject(AuthService);

  // app checkLogged() already prompts (askToLogin) when not logged
  ensureAuthenticated(): boolean {
    return this.auth.checkLogged();
  }

  isAuthenticated(): boolean {
    return this.auth.isLogged();
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

  async forward(commands: unknown[], opts?: NavOptions): Promise<boolean> {
    await this.nav.navigateForward(commands as any[], {
      queryParams: opts?.queryParams,
      replaceUrl: opts?.replaceUrl,
    });
    return true;
  }

  async back(): Promise<void> {
    // Prefer popping the Ionic stack; fall back to platform back.
    await Promise.resolve(this.nav.pop()).catch(() => this.nav.back());
  }

  async root(commands: unknown[], opts?: NavOptions): Promise<boolean> {
    await this.nav.navigateRoot(commands as any[], {
      queryParams: opts?.queryParams,
    });
    return true;
  }

  registerHardwareBack(handler: () => boolean): void {
    // handler() returns true if it consumed the event; otherwise default back.
    App.addListener('backButton', () => {
      if (!handler()) {
        this.nav.back();
      }
    });
  }
}
