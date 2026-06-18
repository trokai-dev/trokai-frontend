import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { PasswordServiceService } from '../services/password-service.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoginPage } from '../auth/login/login.page';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import {
  IonContent,
  IonGrid,
  IonHeader,
  IonNav,
  IonTitle,
  IonToolbar,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular/standalone';
import { FirebaseService } from '../services/firebase.service';
import { ToastService } from '../services/toast-service';
import { NewPasswordFormComponent, NewPasswordValue } from '@trokai/shared-ui';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonContent,
    BackButtonComponent,
    NewPasswordFormComponent,
  ],
})
export class NewPasswordPage implements OnInit, OnDestroy {
  private passwordService = inject(PasswordServiceService);
  private navCtrl = inject(NavController);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);
  private platform = inject(Platform);
  private ionNav = inject(IonNav, { optional: true });
  private navParams = inject(NavParams, { optional: true });

  forgot = false;
  isAuth = false;
  backNavSub: Subscription;

  ngOnInit() {
    this.forgot = !this.authService.getUserValue();
    this.isAuth =
      this.navParams && this.navParams.data && this.navParams.data.auth;

    this.backNavSub = this.platform.backButton.subscribeWithPriority(
      90,
      async () => {
        this.clickBack();
      },
    );
  }

  async save({ currentPassword, password }: NewPasswordValue) {
    try {
      if (this.forgot) {
        await this.passwordService.changePasswordForgot(password).toPromise();
        this.toastService.makeToast('Senha alterada!');
        this.ionNav.setRoot(LoginPage);
      } else {
        await this.passwordService
          .changePassword(currentPassword, password)
          .toPromise();
        this.firebaseService.log('ALTERAR_SENHA');
        this.toastService.makeToast('Senha alterada!');
        this.navCtrl.pop();
      }
    } catch { /* intentional */ }
  }

  async clickBack() {
    if (this.isAuth) this.ionNav.pop();
    else this.navCtrl.back();
  }

  ngOnDestroy(): void {
    if (this.backNavSub) this.backNavSub.unsubscribe();
  }
}
