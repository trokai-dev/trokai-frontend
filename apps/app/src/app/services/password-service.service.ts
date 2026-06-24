import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { take, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthResponseData } from '@trokai/shared-core';

@Injectable({
  providedIn: 'root',
})
export class PasswordServiceService {
  private authService = inject(AuthService);
  private httpClient = inject(HttpClient);

  emailToCode = null; // email para enviar o codigo de alterar a senha
  code = null;
  validatingUser = null;

  changePassword(currentPassword, newPassword) {
    let token;
    this.authService.user$.pipe(take(1)).subscribe((u) => (token = u.token));

    // tslint:disable-next-line: object-literal-shorthand
    return this.httpClient.post(
      environment.urlApi + '/users/new-password',
      { currentPassword: currentPassword, newPassword: newPassword },
      {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      },
    );
  }

  changePasswordForgot(newPassword) {
    return this.httpClient
      .post(environment.urlApi + '/users/change-password-forgot', {
        email: this.emailToCode,
        code: this.code,
        newPassword: newPassword,
      })
      .pipe(
        tap((r) => {
          this.emailToCode = null;
          this.code = null;
        }),
      );
  }

  sendForgotCode(email: string) {
    return this.httpClient.post(environment.urlApi + '/users/forgot-password', {
      email: email,
    });
  }

  verifyCode(code: string, email: string) {
    return this.httpClient
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
      );
  }
}
