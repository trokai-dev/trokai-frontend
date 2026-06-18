import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  NavController,
  IonNav,
  Platform,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ForgotPasswordEmailPage } from '../forgot-password-email/forgot-password-email.page';
import { RegisterPage } from '../register/register.page';
import { Keyboard } from '@capacitor/keyboard';
import { BackButtonComponent } from 'src/app/shared/components/back-button/back-button.component';
import { CompletingInformationService } from '@trokai/shared-data-access';
import {
  LoadingService,
  LoginCredentials,
  LoginFormComponent,
} from '@trokai/shared-ui';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    BackButtonComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    LoginFormComponent,
  ],
})
export class LoginPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private ionNav = inject(IonNav);
  private platform = inject(Platform);
  private completingInfoService = inject(CompletingInformationService);
  private loadingService = inject(LoadingService);

  loading = false;
  backNavSub: Subscription;

  ngOnInit() {
    this.authService.logged.subscribe((logged) => {
      if (logged && !this.completingInfoService.hasFlow)
        this.router.navigateByUrl('/main/home', { replaceUrl: true });
    });

    this.backNavSub = this.platform.backButton.subscribeWithPriority(
      90,
      async () => {
        this.clickBack();
      },
    );
  }

  toForgot() {
    this.ionNav.push(ForgotPasswordEmailPage);
  }

  async login({ email, password }: LoginCredentials) {
    if (this.loading) return;

    if (this.platform.is('mobile') && this.platform.is('hybrid')) {
      Keyboard.setAccessoryBarVisible({ isVisible: false });
      Keyboard.hide();
    }

    try {
      this.loading = true;
      this.loadingService.start('Verificando');
      await this.authService.login(email, password).toPromise();
      this.router.navigateByUrl('/main/home', { replaceUrl: true });
    } finally {
      this.loading = false;
      this.loadingService.finish();
    }
  }

  toRegister() {
    this.ionNav.push(RegisterPage);
  }

  async clickBack() {
    if (await this.ionNav.canGoBack()) this.ionNav.pop();
    else this.navCtrl.back();
  }

  ngOnDestroy(): void {
    if (this.backNavSub) this.backNavSub.unsubscribe();
  }
}
