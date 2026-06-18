import { Route } from '@angular/router';
import { PurchasesComponent } from './purchases/purchases.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { SalesComponent } from './sales/sales.component';
import { SaleComponent } from './sale/sale.component';
import { ChatComponent } from '../chat/chat.component';
import { PostageOptionsComponent } from './postage-options/postage-options.component';

export default [
  { path: '', redirectTo: 'purchases', pathMatch: 'full' },
  {
    path: 'purchases',
    component: PurchasesComponent,
    data: {
      clearNav: true,
    },
  },
  {
    path: 'purchases/:order_id',
    component: PurchaseComponent,
    data: {
      clearNav: true,
    },
  },
  {
    path: 'purchases/:order_id/chat',
    component: ChatComponent,
    data: {
      clearNav: true,
    },
  },
  {
    path: 'sales',
    component: SalesComponent,
    data: {
      clearNav: true,
    },
  },
  {
    path: 'sales/:order_id',
    component: SaleComponent,
    data: {
      clearNav: true,
    },
  },
  {
    path: 'sales/:order_id/chat',
    component: ChatComponent,
    data: {
      clearNav: true,
    },
  },
  {
    path: 'sales/:order_id/postage-options',
    component: PostageOptionsComponent,
    data: {
      clearNav: true,
    },
  },
] satisfies Route[];
