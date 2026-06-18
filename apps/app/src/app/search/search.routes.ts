import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./search.page').then((m) => m.SearchPage),
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
    path: 'carts',
    loadComponent: () => import('../carts/carts.page').then((m) => m.CartsPage),
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
