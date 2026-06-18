import { Route } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { MainPage } from './main.page';

export default [
  {
    path: '',
    loadComponent: () => import('./main.page').then((m) => m.MainPage),
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.routes'),
      },
      {
        path: 'home/notifications',
        loadComponent: () =>
          import('../notifications/notifications.page').then(
            (m) => m.NotificationsPage,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'home/carts',
        loadComponent: () =>
          import('../carts/carts.page').then((m) => m.CartsPage),
      },
      {
        path: 'search',
        loadChildren: () => import('../search/search.routes'),
      },
      {
        path: 'negotiations',
        loadChildren: () => import('../negotiations/negotiations.routes'),
        canActivate: [AuthGuard],
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile-tab/profile-tab.routes'),
        canActivate: [AuthGuard],
      },
      {
        path: 'auth',
        loadChildren: () => import('../auth/auth.routes'),
      },
    ],
  },
] satisfies Route[];
