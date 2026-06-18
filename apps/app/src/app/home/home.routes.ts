import { Route } from '@angular/router';
import { HomePage } from './home.page';
import { WardrobePage } from '../wardrobe/wardrobe.page';
import { CartsPage } from '../carts/carts.page';

export default [
  {
    path: '',
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
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
    loadComponent: () =>
      import('../wardrobe/wardrobe.page').then((m) => m.WardrobePage),
  },
  {
    path: 'wardrobe/:owner_id/:time',
    loadComponent: () =>
      import('../wardrobe/wardrobe.page').then((m) => m.WardrobePage),
  },
  {
    path: 'carts',
    loadComponent: () => import('../carts/carts.page').then((m) => m.CartsPage),
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
] satisfies Route[];
