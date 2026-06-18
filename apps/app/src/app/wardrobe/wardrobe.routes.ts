import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./wardrobe.page').then((m) => m.WardrobePage),
  },
  {
    path: 'product/:product_id',
    loadChildren: () => import('../product/product.routes'),
  },
] satisfies Route[];
