import { Router } from '@angular/router';
import { AlertService } from '@trokai/shared-ui';
import {
  RecoveryCodeFormComponent,
  RecoveryEmailFormComponent,
} from '@trokai/shared-ui';
import { Component, OnInit, inject } from '@angular/core';
import { PasswordService } from 'src/app/services/password.service';
import { GlobalService } from 'src/app/services/global.service';
import { PasswordComponent } from '../../account/password/password.component';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
  standalone: true,
  imports: [
    RecoveryEmailFormComponent,
    RecoveryCodeFormComponent,
    PasswordComponent,
  ],
})
export class PasswordRecoveryComponent implements OnInit {
  private alert = inject(AlertService);
  private passwordService = inject(PasswordService);
  private globalService = inject(GlobalService);
  private router = inject(Router);

  email = '';
  emailSent = false;
  verified = false;

  ngOnInit(): void {
    this.globalService.setTitle('Recuperar senha');
  }

  async send(email: string) {
    if (this.emailSent) return;
    try {
      this.email = email;
      await this.passwordService.sendForgotCode(email);
      this.alert.alert('Código enviado!');
      this.emailSent = true;
    } catch {
      /* intentional */
    }
  }

  async verify(code: string) {
    try {
      await this.passwordService.verifyCode(code, this.email);
      this.verified = true;
    } catch {
      /* intentional */
    }
  }

  updated() {
    this.router.navigateByUrl('/auth/login');
  }
}
