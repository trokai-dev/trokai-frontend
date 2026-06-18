import { Route } from '@angular/router';
import { ProductRegisterComponent } from './product-register.component';

export default [
  { path: '', component: ProductRegisterComponent },
  { path: ':product_id', component: ProductRegisterComponent },
  { path: 'duplicate/:product_id', component: ProductRegisterComponent },
] satisfies Route[];
