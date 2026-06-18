import { Injectable } from '@angular/core';
import { User } from '../models/user';

export interface NavOptions {
  replaceUrl?: boolean;
  queryParams?: Record<string, unknown>;
}

/**
 * Platform-agnostic navigation contract for business logic. Shared services and
 * components inject `NavigationManager` and never touch `Router` (web) or
 * `NavController` (app) directly. Each app provides a concrete implementation:
 *   web  -> WebNavigationManager      (Angular Router, clean URLs)
 *   app  -> MobileNavigationManager   (Ionic NavController, native stacks)
 *
 * Routing CONFIG stays separate per platform — only imperative navigation is
 * inverted here.
 */
@Injectable()
export abstract class NavigationManager {
  /** Push forward in a stack (app) / normal navigate (web). */
  abstract forward(commands: unknown[], opts?: NavOptions): Promise<boolean>;
  /** Pop one level / browser back. */
  abstract back(): Promise<void>;
  /** Reset the stack to a root (app tab root) / replaceUrl navigate (web). */
  abstract root(commands: unknown[], opts?: NavOptions): Promise<boolean>;
  /** Register an OS/hardware back handler — no-op on web, Capacitor App back on app. */
  abstract registerHardwareBack(handler: () => boolean): void;
  /**
   * True if a user is logged in. If not, triggers the platform's login flow
   * (prompt + route to login) and returns false. Lets shared business logic
   * gate actions on auth without depending on a per-app AuthService.
   */
  abstract ensureAuthenticated(): boolean;
  /** Silent logged-in check — no prompt, no navigation. */
  abstract isAuthenticated(): boolean;
  /** Current user id, or undefined when logged out. */
  abstract currentUserId(): string | undefined;
  /** Current logged-in user snapshot, or undefined/null when logged out. */
  abstract currentUser(): User | undefined | null;
  /** Re-fetch the user from the API and update the per-app session. */
  abstract syncUserData(): Promise<void>;
}
