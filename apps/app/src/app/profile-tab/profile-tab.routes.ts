import { Route } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./profile-tab.page').then((m) => m.ProfileTabPage),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('../favorites/favorites.page').then((m) => m.FavoritesPage),
  },
  {
    path: 'fees',
    loadComponent: () => import('../fees/fees.page').then((m) => m.FeesPage),
  },
  {
    path: 'options',
    loadChildren: () => import('../options/options.routes'),
  },
  {
    path: 'help',
    loadComponent: () =>
      import('../support/support.page').then((m) => m.SupportPage),
  },
  {
    path: 'help/faq/:slug',
    loadComponent: () =>
      import('../support/faq/faq.page').then((m) => m.FaqPage),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('../notifications/notifications.page').then(
        (m) => m.NotificationsPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'product/:product_id',
    loadChildren: () => import('../product/product.routes'),
  },
  {
    path: 'product/:product_id/:time',
    loadChildren: () => import('../product/product.routes'),
  },
  {
    path: 'inventory',
    loadChildren: () => import('../wardrobe/wardrobe.routes'),
  },
  {
    path: 'wardrobe/:owner_id',
    loadChildren: () => import('../wardrobe/wardrobe.routes'),
  },
  {
    path: 'wardrobe/:owner_id/:time',
    loadChildren: () => import('../wardrobe/wardrobe.routes'),
  },
] satisfies Route[];
