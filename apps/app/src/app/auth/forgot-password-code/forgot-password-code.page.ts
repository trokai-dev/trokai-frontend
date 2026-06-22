import { Component, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { PasswordServiceService } from 'src/app/services/password-service.service';

import { NewPasswordPage } from 'src/app/new-password/new-password.page';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import {
  IonContent,
  IonHeader,
  IonNav,
  IonToolbar,
  NavController,
  Platform,
} from '@ionic/angular/standalone';
import { AlertService, LoadingService } from '@trokai/shared-ui';
import { RecoveryCodeFormComponent } from '@trokai/shared-ui';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-forgot-password-code',
  templateUrl: './forgot-password-code.page.html',
  styleUrls: ['./forgot-password-code.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonContent,
    IonToolbar,
    BackButtonComponent,
    RecoveryCodeFormComponent,
  ],
})
export class ForgotPasswordCodePage implements OnDestroy {
  private platform = inject(Platform);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private loadingService = inject(LoadingService);
  private passwordService = inject(PasswordServiceService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private ionNav = inject(IonNav);
  private completingInfoService = inject(CompletingInformationService);

  authSub: Subscription;
  email = '';
  backNavSub: Subscription;

  async ionViewWillEnter() {
    this.email = this.passwordService.emailToCode;

    try {
      await this.passwordService.sendForgotCode(this.email).toPromise();
    } catch {
      this.navCtrl.pop();
    }

    this.authSub = this.authService.logged.subscribe((logged) => {
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

  async verify(code: string) {
    this.loadingService.start('Verificando');
    try {
      const response = await this.passwordService
        .verifyCode(code, this.email)
        .toPromise();
      this.passwordService.validatingUser = response.user;
      this.ionNav.push(NewPasswordPage, { auth: true });
    } catch {
      this.alertService.showAlert('', 'Código incorreto');
    } finally {
      this.loadingService.finish();
    }
  }

  ionViewWillLeave() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  clickBack() {
    this.ionNav.pop();
  }

  ngOnDestroy(): void {
    if (this.backNavSub) this.backNavSub.unsubscribe();
  }
}
