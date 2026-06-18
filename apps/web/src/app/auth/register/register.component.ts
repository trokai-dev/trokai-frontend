import {
  LoadingService,
  RegisterCredentials,
  RegisterFormComponent,
  TkGoogleBtnComponent,
} from '@trokai/shared-ui';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from '@trokai/shared-data-access';
import { Component, OnInit, inject } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [RegisterFormComponent, MatButtonModule, TkGoogleBtnComponent],
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private globalService = inject(GlobalService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  loading = false;
  emailRegistered = false;

  ngOnInit(): void {
    this.globalService.setTitle('Cadastro');
    if (this.authService.checkLogged()) this.router.navigate(['/']);
  }

  async checkMail(email: string) {
    try {
      this.loading = true;
      this.loadingService.start();
      this.emailRegistered = await this.userService.emailRegistered(email);
    } finally {
      this.loading = false;
      this.loadingService.finish();
    }
  }

  async register({ name, email, password }: RegisterCredentials) {
    if (this.loading) return;
    try {
      this.loading = true;
      this.loadingService.start('Criando sua conta');
      await this.authService.register(name, email, password);
    } finally {
      this.loading = false;
      this.loadingService.finish();
    }
  }

  toLogin() {
    this.router.navigate(['/auth/login']);
  }

  googleRegister() {
    this.authService.startGoogle();
  }
}
