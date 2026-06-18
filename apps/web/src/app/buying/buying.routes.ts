import { CartsComponent } from './carts/carts.component';
import { CheckoutV2Component } from './checkout/checkout-v2.component';
import { ShippingOptionsComponent } from './checkout/shipping-options/shipping-options.component';
import { TkShippingAddressComponent as ShippingAddressComponent } from '@trokai/shared-ui';
import { PaymentOptionsComponent } from './checkout/payment-options/payment-options.component';
import { NewCardComponent } from './checkout/new-card/new-card.component';
import { CheckoutReviewComponent } from './checkout/checkout-review/checkout-review.component';
import { CheckoutInstallmentsComponent } from './checkout/checkout-installments/checkout-installments.component';
import { Route } from '@angular/router';

export default [
  { path: '', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'carts', component: CartsComponent },
  { path: 'checkout-v2', redirectTo: 'checkout' }, // temporary redirect for old URLs
  {
    path: 'checkout',
    component: CheckoutV2Component,
    data: { hideNav: true },
    loadChildren: () => [
      {
        path: 'shipping',
        component: ShippingOptionsComponent,
        data: { hideNav: true },
      },
      {
        path: 'shipping-address',
        component: ShippingAddressComponent,
        data: { hideNav: true },
      },
      {
        path: 'payment-options',
        component: PaymentOptionsComponent,
        data: { hideNav: true },
      },
      {
        path: 'new-card',
        component: NewCardComponent,
        data: { hideNav: true },
      },
      {
        path: 'installments',
        component: CheckoutInstallmentsComponent,
        data: { hideNav: true },
      },
      {
        path: 'review',
        component: CheckoutReviewComponent,
        data: { hideNav: true },
      },
    ],
  },
] satisfies Route[];
