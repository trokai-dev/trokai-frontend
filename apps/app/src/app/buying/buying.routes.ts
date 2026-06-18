import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadChildren: () => import('./buying-root/buying-root.routes'),
  },
] satisfies Route[];
