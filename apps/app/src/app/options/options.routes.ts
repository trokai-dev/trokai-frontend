import { Route } from '@angular/router';
import { OptionsPage } from './options.page';

export default [
  {
    path: '',
    loadComponent: () => import('./options.page').then((m) => m.OptionsPage),
  },
  {
    path: 'cards',
    loadChildren: () => import('../cards/cards.routes'),
  },
  {
    path: 'address',
    loadComponent: () =>
      import('../address/address.page').then((m) => m.AddressPage),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'bank',
    loadChildren: () => import('../bank/bank.routes'),
  },
  {
    path: 'store',
    loadComponent: () =>
      import('../store-options/store-options.page').then(
        (m) => m.StoreOptionsPage,
      ),
  },
] satisfies Route[];
