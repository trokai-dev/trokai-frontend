import { Component, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Browser } from '@capacitor/browser';
import { LoginPage } from './login/login.page';

import {
  SignInWithApple,
  SignInWithAppleResponse,
  SignInWithAppleOptions,
} from '@capacitor-community/apple-sign-in';

import {
  IonContent,
  IonImg,
  IonNav,
  isPlatform,
  LoadingController,
  IonText,
  IonSpinner,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import {
  AlertService,
  TkAppleBtnComponent,
  TkGoogleBtnComponent,
} from '@trokai/shared-ui';
import { FirebaseService } from '../services/firebase.service';
import { ToastService } from '../services/toast-service';
import { MainService } from '../services/main.service';
import { environment } from 'src/environments/environment';
import { SocialLogin } from '@capgo/capacitor-social-login';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonText,
    IonContent,
    IonImg,
    MatButtonModule,
    TkGoogleBtnComponent,
    TkAppleBtnComponent,
  ],
})
export class AuthPage implements OnDestroy, AfterViewInit {
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private ionNav = inject(IonNav);
  private firebaseService = inject(FirebaseService);
  private mainService = inject(MainService);
  private alert = inject(AlertService);

  // user: Observable<firebase.default.User>;
  user;
  authSub: Subscription;
  hasAuth = false;
  loading = false;
  showPhone = false;
  showApple = false;

  ngAfterViewInit() {
    if (isPlatform('ios')) this.showApple = true;
  }

  async openPoliticas() {
    this.mainService.openTrokaiWebsitePath('/politica-de-privacidade');
    this.firebaseService.log('POLITICA_PRIVACIDADE');
  }

  async openTermos() {
    this.mainService.openTrokaiWebsitePath('/termos-de-uso');
    this.firebaseService.log('TERMOS_DE_USO');
  }

  async goToLogin() {
    this.ionNav.push(LoginPage);
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  async googleLogin() {
    try {
      const googleUser = await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['email', 'profile'], forceRefreshToken: true },
      });
      this.proceedToLogin(googleUser);
    } catch (ex) {
      console.log('ERRO GOOGLE');
      console.log(JSON.stringify(ex));
      this.toastService.makeToastErrorDefault();
      // this.alert.showAlert('ERRO GOOGLE', JSON.stringify(ex));
    }
  }

  async appleLogin() {
    console.log('--- TESTE APPLE ---');

    try {
      const options: SignInWithAppleOptions = {
        clientId: 'com.trokai.mobile',
        redirectURI: 'https://www.trokai.com.br',
        scopes: 'email name',
        state: '12345',
        nonce: 'nonce',
      };

      const res = await (await SignInWithApple.authorize(options)).response;

      console.log('--- RES APPLE ---');
      console.log(res);

      // https://developer.apple.com/documentation/signinwithapplerestapi/verifying_a_user
      // alert('Send token to apple for verification: ' + res.identityToken);

      if (res && res.identityToken) {
        const appleUser = {
          // always
          authorizationCode: res.authorizationCode,
          identityToken: res.identityToken,
          appleId: res.user,
          // first time
          email: res.email,
          givenName: res.givenName,
          familyName: res.familyName,
        };

        this.proceedToLoginApple(appleUser);
      } else {
        this.toastService.makeToastErrorDefault();
      }
    } catch (error) {
      this.toastService.makeToastErrorDefault();
      console.log(error);
    }
  }

  async proceedToLogin(gUser) {
    const loading = await this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Autenticando...',
    });

    loading.present();

    try {
      const response = await this.authService.googleAuth(gUser.result.profile);

      if (response.isRegister) {
        this.router.navigateByUrl('/main/home', { replaceUrl: true });
        this.firebaseService.log('AUTH_GOOGLE_CADASTRO');
      } else {
        this.router.navigateByUrl('/main/home', { replaceUrl: true });
        this.firebaseService.log('AUTH_GOOGLE_LOGIN');
      }
    } catch {
      this.toastService.makeToast('Não foi possível logar');
    } finally {
      loading.dismiss();
    }
  }

  async proceedToLoginApple(appleUser) {
    const loading = await this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Autenticando...',
    });

    loading.present();

    try {
      const response = await this.authService.appleAuth(appleUser);

      if (response.isRegister) {
        this.router.navigateByUrl('/main/home', { replaceUrl: true });
        this.firebaseService.log('AUTH_APPLE_CADASTRO');
      } else {
        this.router.navigateByUrl('/main/home', { replaceUrl: true });
        this.firebaseService.log('AUTH_APPLE_LOGIN');
      }
    } catch {
      this.toastService.makeToast('Não foi possível logar');
    } finally {
      loading.dismiss();
    }
  }
}
