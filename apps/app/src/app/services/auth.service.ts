import { AuthResponseData, StorageService, User } from '@trokai/shared-core';
import { UserService } from '@trokai/shared-data-access';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, lastValueFrom, of } from 'rxjs';
import { map, tap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NavController, Platform } from '@ionic/angular/standalone';
import { AlertService } from '@trokai/shared-ui';
import { PushNotificationsService } from './push-notifications.service';
import { SocialLogin } from '@capgo/capacitor-social-login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private platform = inject(Platform);
  private alertService = inject(AlertService);
  private pushService = inject(PushNotificationsService);
  private navCtrl = inject(NavController);
  private storage = inject(StorageService);

  validatingPhone = '';
  validatingUser = {};

  redirectUrlPicture = null;
  hasPassword = null;

  private _user = new BehaviorSubject<User>(null); // atualiza os objetos de usuario
  private _logged = new BehaviorSubject<boolean>(null); // atualiza o usuario apenas login/logout

  get logged() {
    return this._logged.asObservable();
  }

  get user() {
    return this._user.asObservable();
  }

  // used to verify apple token
  async checkUserTokens() {
    this.http.get(environment.urlApi + '/users/sync').subscribe();
  }

  // used to fech updated data
  async syncUserData() {
    const updatedUser = await this.userService.getUserInfo();
    updatedUser.token = this._user.getValue().token;

    this._user.next(updatedUser);
  }

  syncAvatar(avatar) {
    this.user.pipe(take(1)).subscribe((u) => {
      u.avatar = avatar;
      this._user.next(u);
    });
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(environment.urlApi + '/users/login', {
        email: email,
        password: password,
      })
      .pipe(tap(this.setUserData.bind(this)));
  }

  googleAuth(gUser) {
    return lastValueFrom(
      this.http
        .post<AuthResponseData>(environment.urlApi + '/users/google', { gUser })
        .pipe(tap(this.setUserData.bind(this))),
    );
  }

  appleAuth(appleUser) {
    return lastValueFrom(
      this.http
        .post<AuthResponseData>(environment.urlApi + '/users/apple', {
          appleUser,
        })
        .pipe(tap(this.setUserData.bind(this))),
    );
  }

  async userHasPassword() {
    this.hasPassword = await this.userService.userHasPassword();
    return this.hasPassword;
  }

  async register(name: string, email: string, password: string) {
    const res = await this.userService.register(name, email, password);
    await this.setUserData(res);
    return res;
  }

  async updateUser(user) {
    const res = await this.userService.updateUser(user);
    await this.syncUserData();
    return res;
  }

  private async setUserData(userData: AuthResponseData) {
    const user = userData.user;
    user.token = userData.token;

    this._user.next(user);
    this._logged.next(true);

    await this.storeAuthData(user._id, user.name, user.email, user.token);
  }

  async storeAuthData(
    userId: string,
    name: string,
    email: string,
    token: string,
  ) {
    const storedJ = await this.storage.getObject<{ userId: string }>(
      'authData',
    );

    if (storedJ) {
      if (storedJ['userId'].toString().trim() !== userId.toString().trim()) {
        await this.storage.clear();
      }
    }

    await this.storage.setObject('authData', {
      userId: userId,
      name: name,
      email: email,
      token: token,
    });
  }

  async logout(deletedAccount = false) {
    try {
      try {
        // if deleted account, has already been dissociated
        if (!deletedAccount) await this.pushService.userDissociate();
        await SocialLogin.logout({ provider: 'google' });
      } catch (err) {
        console.log('Erro sign out - ', err);
      }

      this.hasPassword = null;
      this._logged.next(null);
      this._user.next(null);
      await this.storage.clear();
    } catch {
      /* intentional */
    }
  }

  autoLogin() {
    // from resolve uma promise e retorna uma observable
    return from(
      this.storage.getObject<{
        userId: string;
        name: string;
        email: string;
        token: string;
      }>('authData'),
    ).pipe(
      tap((user) => {
        if (user) {
          const aux = new User();
          aux.token = user.token;

          this._user.next(aux);

          this.userService.getUserInfo().then(async (u) => {
            // verifica se as informacoes do storage estao corretas
            // se o chat esta atualizado ou se o login e o mesmo do storage
            await this.storeAuthData(u._id, u.name, u.email, user.token);

            u.token = user.token;

            this._user.next(u);
            this._logged.next(true);
          });
        }
      }),
      map((user) => {
        return !!user;
      }),
    );
  }

  // Retorna o valor atual do user
  getUserValue(): User {
    return this._user.getValue();
  }

  isLogged() {
    return this._logged.getValue();
  }

  async uploadAvatar(image) {
    const res = await this.userService.uploadAvatar(image);
    this.syncAvatar(res.imageName);
    return res;
  }

  async deleteAccount() {
    await this.userService.deleteAccount(this.getUserValue()._id);
    this.logout(true);
  }

  checkLogged() {
    const logged = !!this.getUserValue();

    if (!logged) this.askToLogin();

    return logged;
  }

  async askToLogin() {
    const login = await this.alertService.askQuestion(
      'Entre no Trokaí',
      'Faça login ou crie uma conta para aproveitar todos os recursos do Trokaí',
      'Entrar agora',
      'Agora não',
    );

    if (login) this.navCtrl.navigateRoot('/main/auth');
  }
}
