import { tap } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { Injectable, inject } from '@angular/core';
import { AuthResponseData, User } from '@trokai/shared-core';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private authService = inject(AuthService);
  private httpClient = inject(HttpClient);

  emailToCode: string | null = null; // email para enviar o codigo de alterar a senha
  code: string | null = null;
  validatingUser: User | null = null;

  changePassword(currentPassword: string, newPassword: string) {
    return lastValueFrom(
      this.httpClient.post(environment.urlApi + '/users/new-password', {
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    );
  }

  changePasswordForgot(newPassword: string) {
    return lastValueFrom(
      this.httpClient
        .post(environment.urlApi + '/users/change-password-forgot', {
          email: this.emailToCode,
          code: this.code,
          newPassword: newPassword,
        })
        .pipe(
          tap(() => {
            this.emailToCode = null;
            this.code = null;
          }),
        ),
    );
  }
  sendForgotCode(email: string) {
    return lastValueFrom(
      this.httpClient.post(environment.urlApi + '/users/forgot-password', {
        email: email,
      }),
    );
  }

  verifyCode(code: string, email: string) {
    return lastValueFrom(
      this.httpClient
        .post<AuthResponseData>(
          environment.urlApi + '/users/verify-email-password-code',
          {
            email: email,
            code: code,
          },
        )
        .pipe(
          tap((r) => {
            this.emailToCode = email;
            this.code = code;
            this.validatingUser = r.user;
          }),
        ),
    );
  }
}
