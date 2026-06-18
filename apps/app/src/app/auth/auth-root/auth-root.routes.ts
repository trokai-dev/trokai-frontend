import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./auth-root.page').then((m) => m.AuthRootPage),
  },
] satisfies Route[];
