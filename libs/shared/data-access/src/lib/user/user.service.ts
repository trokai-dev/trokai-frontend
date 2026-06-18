import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG, PhoneOtpMethod, User } from '@trokai/shared-core';
import { lastValueFrom, map } from 'rxjs';
import { UserAuthResponse } from './user.models';

/**
 * Platform-agnostic user-resource HTTP. Holds no session/auth state — callers
 * (each app's AuthService) orchestrate the session write-back side effects.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;

  async getUserInfo(): Promise<User> {
    const res = await lastValueFrom(
      this.http.get<User>(`${this.urlApi}/users/me`),
    );
    return new User({ ...res });
  }

  /** Public profile of another user by id or nick. */
  async getUserById(idOrNick: string): Promise<User> {
    const res = await lastValueFrom(
      this.http.get<User>(`${this.urlApi}/users/${idOrNick}`, {
        headers: { CacheEnabled: 'true' },
      }),
    );
    return new User(res);
  }

  /** Send the phone-verification OTP via the chosen channel. */
  sendPhoneOtp(method: PhoneOtpMethod): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.urlApi}/users/send-phone-otp`, { method }),
    );
  }

  /** Verify the phone with the received OTP code. */
  verifyPhoneOtp(code: string): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.urlApi}/users/verify-phone-otp`, { code }),
    );
  }

  register(name: string, email: string, password: string) {
    return lastValueFrom(
      this.http.post<UserAuthResponse>(`${this.urlApi}/users`, {
        name,
        email,
        password,
      }),
    );
  }

  updateUser(patch: Partial<User> | Record<string, unknown>) {
    return lastValueFrom(
      this.http.patch<UserAuthResponse>(`${this.urlApi}/users/me`, patch),
    );
  }

  uploadAvatar(image: Blob) {
    const formData = new FormData();
    formData.append('image', image);
    return lastValueFrom(
      this.http.post<{ imageName: string }>(
        `${this.urlApi}/users/avatar`,
        formData,
      ),
    );
  }

  userHasPassword() {
    return lastValueFrom(
      this.http.get<boolean>(`${this.urlApi}/user/has-password`),
    );
  }

  emailRegistered(email: string) {
    return lastValueFrom(
      this.http.post<boolean>(`${this.urlApi}/users/email-registered`, {
        email,
      }),
    );
  }

  phoneRegistered(phone: string) {
    return lastValueFrom(
      this.http.post<boolean>(`${this.urlApi}/users/phone-registered`, {
        phone,
      }),
    );
  }

  deleteAccount(userId: string) {
    return lastValueFrom(this.http.delete(`${this.urlApi}/user/${userId}`));
  }

  getUserReviews(userId: string) {
    return lastValueFrom(
      this.http
        .get<{ reviews: [] }>(`${this.urlApi}/users/${userId}/reviews`)
        .pipe(map((r) => r.reviews)),
    );
  }

  verifyEmail(body: unknown) {
    return lastValueFrom(
      this.http.post(`${this.urlApi}/users/verify-email`, body),
    );
  }

  unsubscribeEmailMarketing(email: string, source: string) {
    return lastValueFrom(
      this.http.post(`${this.urlApi}/users/unsubscribe-email-marketing`, {
        email,
        source,
      }),
    );
  }
}
