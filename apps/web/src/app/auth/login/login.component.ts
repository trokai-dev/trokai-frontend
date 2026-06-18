import {
  LoadingService,
  LoginCredentials,
  LoginFormComponent,
  TkGoogleBtnComponent,
} from '@trokai/shared-ui';
import { Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [LoginFormComponent, MatButtonModule, TkGoogleBtnComponent],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private globalService = inject(GlobalService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  loading = false;

  ngOnInit(): void {
    this.globalService.setTitle('Entrar');
    if (this.authService.checkLogged()) this.router.navigate(['/']);
  }

  async login({ email, password }: LoginCredentials) {
    if (this.loading) return;
    try {
      this.loading = true;
      this.loadingService.start('Verificando');
      await this.authService.login(email, password);
    } finally {
      this.loading = false;
      this.loadingService.finish();
    }
  }

  toForgot() {
    this.router.navigate(['/auth/login/password-recovery']);
  }

  toRegister() {
    this.router.navigate(['/auth/register']);
  }

  appleLogin() {
    this.authService.startApple();
  }

  googleLogin() {
    this.authService.startGoogle();
  }
}
