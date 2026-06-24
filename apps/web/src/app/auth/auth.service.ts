import {
  Address,
  AppleResponse,
  AuthResponseData,
  AuthSessionData,
  StorageService,
  User,
} from '@trokai/shared-core';
import { UserService } from '@trokai/shared-data-access';
import { AlertService } from '@trokai/shared-ui';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, lastValueFrom, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { BrowserRef } from '../services/browser-ref.service';

declare const AppleID: {
  auth: {
    init(config: unknown): Promise<void>;
    signIn(): Promise<AppleResponse>;
  };
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private alert = inject(AlertService);
  private router = inject(Router);
  private oAuthService = inject(OAuthService);
  private browserRef = inject(BrowserRef);
  private storage = inject(StorageService);
  private platformId = inject(PLATFORM_ID);

  private _user = new BehaviorSubject<User | undefined>(undefined); // atualiza os objetos de usuario
  private _logged = new BehaviorSubject<boolean | undefined>(undefined); // atualiza o usuario apenas login/logout

  public addressUpdated$ = new Subject<void>();

  hasPassword: boolean | null = null;

  get logged$() {
    return this._logged.asObservable();
  }

  get user$() {
    return this._user.asObservable();
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.oAuthService.configure({
        issuer: 'https://accounts.google.com',
        strictDiscoveryDocumentValidation: false,
        redirectUri: this.browserRef.window?.location.origin,
        clientId: environment.googleOAuthClientId,
        scope: 'profile email',
      });
    }
  }

  async login(email: string, password: string) {
    try {
      const body = { email: email, password: password };
      const response = await lastValueFrom(
        this.http.post<AuthResponseData>(
          `${environment.urlApi}/users/login`,
          body,
        ),
      );

      this.setUserSession(response);
    } catch {
      /* intentional */
    }
  }

  async setUserSession(response: AuthResponseData) {
    if (!isPlatformBrowser(this.platformId)) return;

    await this.storage.setObject('trokai_auth', {
      _id: response.user._id,
      email: response.user.email,
      token: response.token,
      name: response.user.name,
      avatar: response.user.avatar,
    });

    const user = new User({ ...response.user });
    user.token = response.token;

    this._user.next(user);
    this._logged.next(true);
  }

  // Synchronous on purpose: consumed by the (sync) HTTP interceptor short-circuit
  // and the route guard. localStorage is sync on the browser; StorageService is
  // async, so this single read stays on BrowserRef.
  checkStorageSession() {
    const data = this.browserRef.localStorage?.getItem('trokai_auth');
    if (data) return JSON.parse(data);
  }

  checkLogged() {
    return !!this.getUserValue();
  }

  async askToLogin() {
    const login = await this.alert.question(
      'Faça login ou crie uma conta para aproveitar todos os recursos do Trokaí',
      'Entre no Trokaí',
      'Entrar agora',
      'Agora não',
    );

    if (login) this.redirectToLogin();
  }

  logout() {
    void this.storage.clear();
    this._user.next(undefined);
    this._logged.next(false);
    this.hasPassword = null;
    this.oAuthService.logOut();
  }

  // google
  async startGoogle() {
    try {
      await this.oAuthService.loadDiscoveryDocument();
      await this.oAuthService.tryLoginImplicitFlow();

      if (!this.oAuthService.hasValidAccessToken())
        this.oAuthService.initLoginFlow();
      else {
        await this.oAuthService.loadUserProfile();
      }
    } catch {
      /* intentional */
    }
  }

  async checkGoogleLogged() {
    try {
      await this.oAuthService.loadDiscoveryDocument();
      await this.oAuthService.tryLoginImplicitFlow();

      if (!this.oAuthService.hasValidAccessToken()) return;

      const gUser = (await this.oAuthService.loadUserProfile()) as {
        info: unknown;
      };

      this.googleAuth(gUser.info);
    } catch {
      /* intentional */
    }
  }

  private async googleAuth(gUser: unknown) {
    try {
      const response = await lastValueFrom(
        this.http.post<AuthResponseData>(environment.urlApi + '/users/google', {
          gUser,
        }),
      );
      this.setUserSession(response);
    } catch {
      /* intentional */
    }
  }

  private async appleAuth(appleUser: unknown) {
    try {
      const response = await lastValueFrom(
        this.http.post<AuthResponseData>(environment.urlApi + '/users/apple', {
          appleUser,
        }),
      );
      this.setUserSession(response);
    } catch {
      /* intentional */
    }
  }

  async startApple() {
    try {
      this.browserRef.loadAppleSignIn();

      // setting a small delay to ensure the script is loaded
      // worst case, user will have to click again and it will be loaded by then
      await new Promise((resolve) => setTimeout(resolve, 500));

      await AppleID.auth.init({
        clientId: environment.appleClientId,
        scope: 'name email',
        redirectURI: environment.appleRedirectUri,
        // state: '[STATE]',
        // nonce: '[NONCE]',
        usePopup: true,
      });

      const data: AppleResponse = await AppleID.auth.signIn();
      const jwtParsed = this.parseJwt(data.authorization.id_token) as {
        sub?: string;
      };

      const appleUser = {
        // always
        authorizationCode: data.authorization.code,
        identityToken: data.authorization.id_token,
        appleId: jwtParsed.sub,

        // first time
        email: data.user?.email,
        givenName: data.user?.name?.firstName,
        familyName: data.user?.name?.lastName,
      };

      this.appleAuth(appleUser);
    } catch {
      /* intentional */
    }
  }

  async userHasPassword() {
    this.hasPassword = await this.userService.userHasPassword();
    return this.hasPassword;
  }

  async autoLogin() {
    try {
      if (!isPlatformBrowser(this.platformId)) return;

      const stored = await this.storage.get('trokai_auth');

      if (!stored) {
        this.checkGoogleLogged();
        return;
      }

      const session = JSON.parse(stored) as AuthSessionData;

      const aux = { ...session } as unknown as User;

      this._user.next(aux);
      const user = await this.userService.getUserInfo();

      await this.setUserSession({ user: user, token: session.token });
    } catch (err) {
      if (!environment.production) console.log(err);
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      const response = await this.userService.register(name, email, password);
      this.setUserSession(response);
    } catch {
      /* intentional */
    }
  }

  isLogged() {
    return this._logged.getValue();
  }

  getUserValue() {
    return this._user.getValue();
  }

  async updateAddress(address: Partial<Address>) {
    const payload = { ...address, country: 'BRA' };
    await this.updateUser({ address: payload });
    this.addressUpdated$.next();
  }

  async updateUser(user: Partial<User> | Record<string, unknown>) {
    const res = await this.userService.updateUser(user);
    await this.syncUserData();
    return res;
  }

  async syncUserData() {
    try {
      const updatedUser = await this.userService.getUserInfo();
      const current = this._user.getValue();
      if (current) updatedUser.token = current.token;

      this._user.next(updatedUser);
    } catch {
      /* intentional */
    }
  }

  async uploadAvatar(image: Blob) {
    const res = await this.userService.uploadAvatar(image);
    this.syncAvatar(res.imageName);
    return res;
  }

  redirectToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  syncAvatar(avatar: string) {
    const u = this.getUserValue();
    if (!u) return;
    u.avatar = avatar;
    this._user.next(u);
  }

  deleteAccount() {
    return this.userService.deleteAccount(this._user.getValue()?._id ?? '');
  }

  // apple token
  parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }
}
