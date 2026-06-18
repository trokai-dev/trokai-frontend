import { Route, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { CanDeactivateGuard } from './shared/classes/can-deactivate.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/main/home', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'main',
    loadChildren: () => import('./main/main.routes'),
  },
  {
    path: 'presentation',
    loadComponent: () =>
      import('./auth/onboarding/onboarding.page').then((m) => m.OnboardingPage),
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'new-password',
    loadComponent: () =>
      import('./new-password/new-password.page').then((m) => m.NewPasswordPage),
  },
  {
    path: 'new-item',
    loadChildren: () => import('./new-item/new-item.routes'),
    canLoad: [AuthGuard],
  },
  {
    path: 'profile-completing',
    loadComponent: () =>
      import('./profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'phone-verification',
    loadComponent: () =>
      import('./profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'address-completing',
    loadComponent: () =>
      import('./address/address.page').then((m) => m.AddressPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'store-completing',
    loadComponent: () =>
      import('./store-options/store-options.page').then(
        (m) => m.StoreOptionsPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'buying',
    loadChildren: () => import('./buying/buying.routes'),
    canLoad: [AuthGuard],
  },
  {
    path: 'cards',
    loadChildren: () => import('./cards/cards.routes'),
    canLoad: [AuthGuard],
  },
  {
    path: 'negotiations',
    loadChildren: () => import('./negotiations/negotiations.routes'),
    canLoad: [AuthGuard],
  },
  {
    path: 'bank',
    loadChildren: () => import('./bank/bank.routes'),
    canLoad: [AuthGuard],
  },
  {
    path: 'blocked/:reason',
    loadComponent: () =>
      import('./blocked/blocked.page').then((m) => m.BlockedPage),
  },
  {
    path: 'auth-root',
    loadChildren: () => import('./auth/auth-root/auth-root.routes'),
  },

  {
    path: 'store-options',
    loadComponent: () =>
      import('./store-options/store-options.page').then(
        (m) => m.StoreOptionsPage,
      ),
  },
  {
    path: 'carts',
    loadComponent: () => import('./carts/carts.page').then((m) => m.CartsPage),
  },
] satisfies Route[];
