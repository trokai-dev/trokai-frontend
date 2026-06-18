import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadChildren: () => import('./auth-root/auth-root.routes'),
  },
] satisfies Route[];
