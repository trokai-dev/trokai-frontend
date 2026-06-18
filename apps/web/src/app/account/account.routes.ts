import { ProfileComponent } from './profile/profile.component';
import { AddressComponent } from './address/address.component';
import { StoreOptionsComponent } from './store-options/store-options.component';
import { PasswordComponent } from './password/password.component';
import { CardsComponent } from './cards/cards.component';
import { OptionsComponent } from './options/options.component';
import { SellerStatusComponent } from './seller-status/seller-status.component';
import { Route } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
    data: { clearNav: true },
  },
  { path: 'profile', component: ProfileComponent, data: { clearNav: true } },
  { path: 'address', component: AddressComponent, data: { clearNav: true } },
  {
    path: 'wardrobe',
    component: StoreOptionsComponent,
    data: { clearNav: true },
  },
  { path: 'password', component: PasswordComponent, data: { clearNav: true } },
  { path: 'cards', component: CardsComponent, data: { clearNav: true } },
  { path: 'options', component: OptionsComponent, data: { clearNav: true } },
  {
    path: 'seller-status',
    component: SellerStatusComponent,
    data: { clearNav: true },
  },
  {
    path: 'bank',
    loadChildren: () => import('./bank/bank.routes'),
  },
] satisfies Route[];
