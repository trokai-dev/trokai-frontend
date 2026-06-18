import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from '@trokai/shared-ui';
import { NewPasswordFormComponent, NewPasswordValue } from '@trokai/shared-ui';
import { PasswordService } from 'src/app/services/password.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
  standalone: true,
  imports: [NewPasswordFormComponent],
})
export class PasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private passwordService = inject(PasswordService);

  @Input() forgot = false;
  @Output() updated = new EventEmitter();

  ready = false;

  async ngOnInit() {
    try {
      if (!this.forgot) await this.userHasPassword();
      this.ready = true;
    } catch {
      /* intentional */
    }
  }

  async userHasPassword() {
    const hasPassword =
      this.authService.hasPassword !== null
        ? this.authService.hasPassword
        : await this.authService.userHasPassword();

    if (!hasPassword) this.router.navigateByUrl('/account');
  }

  async save({ currentPassword, password }: NewPasswordValue) {
    try {
      if (this.forgot) {
        await this.passwordService.changePasswordForgot(password);
        this.updated.emit();
      } else {
        await this.passwordService.changePassword(
          currentPassword ?? '',
          password,
        );
      }
      this.alertService.alert('Senha alterada!');
    } catch {
      /* intentional */
    }
  }
}
