import { Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { OrdersComponent } from './orders/orders.component';
import { HomeComponent } from './home/home.component';
import { NotificationsComponent } from './notifications/notifications.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    data: { showSearch: true },
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./search/search.component').then((m) => m.SearchComponent),
    data: { showSearch: true },
  },
  {
    path: 'auth',
    component: AuthComponent,
    data: { clearNav: true },
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'buying',
    data: { clearNav: true },
    loadChildren: () => import('./buying/buying.routes'),
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
    data: { clearNav: true },
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AuthGuard],
    data: { clearNav: true },
    loadChildren: () => import('./account/account.routes'),
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [AuthGuard],
    data: { clearNav: true },
    loadChildren: () => import('./orders/orders.routes'),
  },
  {
    path: 'favorites',
    canActivate: [AuthGuard],

    loadComponent: () =>
      import('./favorites/favorites.component').then(
        (m) => m.FavoritesComponent,
      ),
  },
  {
    path: 'collections/:slug',
    loadComponent: () =>
      import('./collection/collection.component').then(
        (m) => m.CollectionComponent,
      ),
    data: { showSearch: true },
  },
  {
    path: 'chats',
    canActivate: [AuthGuard],

    loadComponent: () =>
      import('./chat-list/chat-list.component').then(
        (m) => m.ChatListComponent,
      ),
  },
  {
    path: 'sell',
    data: { clearNav: true },
    canActivate: [AuthGuard],
    loadChildren: () => import('./product-register/product-register.routes'),
  },
  {
    path: 'postage-label/:order_id',
    loadComponent: () =>
      import('./postage-label/postage-label.component').then(
        (m) => m.PostageLabelComponent,
      ),
    data: { hideNav: true },
  },
  {
    path: 'users/:owner_nickname',
    loadComponent: () =>
      import('./wardrobe/wardrobe.component').then((m) => m.WardrobeComponent),
    data: { showSearch: true },
  },
  {
    path: 'items',
    loadChildren: () => import('./product/product.routes'),
  },
  {
    path: 'politica-de-privacidade',
    loadComponent: () =>
      import('./terms/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
    data: { clearNav: true },
  },
  {
    path: 'termos-de-uso',
    loadComponent: () =>
      import('./terms/terms-and-condition/terms-and-condition.component').then(
        (m) => m.TermsAndConditionComponent,
      ),
    data: { clearNav: true },
  },

  {
    path: 'help',
    data: { clearNav: true },
    loadChildren: () => import('./support/support.routes'),
  },
  {
    path: 'email-unsubscribe',
    data: { clearNav: true },
    loadComponent: () =>
      import('./email-unsubscribe/email-unsubscribe.component').then(
        (m) => m.EmailUnsubscribeComponent,
      ),
  },

  {
    path: 'guia-vendedor',
    loadComponent: () =>
      import('./seller-guide/seller-guide.component').then(
        (m) => m.SellerGuideComponent,
      ),
    data: { hideNav: true },
  },

  {
    path: 'seller-onboarding',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./seller-onboarding/seller-onboarding.component').then(
        (m) => m.SellerOnboardingComponent,
      ),
    data: { hideNav: true },
  },

  { path: '**', redirectTo: '' },
];
