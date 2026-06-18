import { Route } from '@angular/router';
import { BankComponent } from './bank.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
export default [
  {
    path: '',
    component: BankComponent,
    data: {
      clearNav: false,
    },
  },
  {
    path: 'withdraw',
    component: WithdrawComponent,
  },
] satisfies Route[];
