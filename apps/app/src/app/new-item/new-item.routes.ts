import { Route } from '@angular/router';
import { CanDeactivateGuard } from '../shared/classes/can-deactivate.guard';

export default [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'form-images',
  },
  {
    path: 'form-images',
    loadComponent: () =>
      import('./form-images/form-images.page').then((m) => m.FormImagesPage),
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./product-register/product-register.page').then(
        (m) => m.ProductRegisterPage,
      ),
    canDeactivate: [CanDeactivateGuard],
  },
] satisfies Route[];
