import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { RegisterComponent } from './register/register.component';

export default [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { clearNav: true } },
  {
    path: 'login/password-recovery',
    component: PasswordRecoveryComponent,
    data: { clearNav: true },
  },
  { path: 'apple', component: LoginComponent, data: { clearNav: true } },
  { path: 'register', component: RegisterComponent, data: { clearNav: true } },
] satisfies Route[];
