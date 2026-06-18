import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./negotiations.page').then((m) => m.NegotiationsPage),
  },
  {
    path: ':tab',
    loadComponent: () =>
      import('./negotiations.page').then((m) => m.NegotiationsPage),
  },
  {
    path: 'sale/:order_id',
    loadComponent: () =>
      import('../orders/sale/sale.page').then((m) => m.SalePage),
  },
  {
    path: 'sale/:order_id/postage-options',
    loadComponent: () =>
      import('../orders/postage-options/postage-options.component').then(
        (m) => m.PostageOptionsComponent,
      ),
  },
  {
    path: 'sale/:order_id/:open_chat',
    loadComponent: () =>
      import('../orders/sale/sale.page').then((m) => m.SalePage),
  },
  {
    path: 'purchase/:order_id',
    loadComponent: () =>
      import('../orders/purchase/purchase.page').then((m) => m.PurchasePage),
  },
  {
    path: 'purchase/:order_id/:open_chat',
    loadComponent: () =>
      import('../orders/purchase/purchase.page').then((m) => m.PurchasePage),
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
    path: 'wardrobe/:owner_id',
    loadChildren: () => import('../wardrobe/wardrobe.routes'),
  },
  {
    path: 'wardrobe/:owner_id/:time',
    loadChildren: () => import('../wardrobe/wardrobe.routes'),
  },
] satisfies Route[];
