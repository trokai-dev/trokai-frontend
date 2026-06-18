import { Route } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('../bank/bank.page').then((m) => m.BankPage),
  },
  {
    path: 'bank-account',
    loadComponent: () =>
      import('./bank-account-form/bank-account-form.page').then(
        (m) => m.BankAccountFormPage,
      ),
  },
  {
    path: 'withdraw',
    loadComponent: () =>
      import('./withdraw/withdraw.page').then((m) => m.WithdrawPage),
  },
] satisfies Route[];
