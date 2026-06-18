import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./buying-root.page').then((m) => m.BuyingRootPage),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./buying-root.page').then((m) => m.BuyingRootPage),
  },
] satisfies Route[];
