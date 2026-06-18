import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { IonNav, Platform } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { PasswordServiceService } from 'src/app/services/password-service.service';
import { ForgotPasswordCodePage } from '../forgot-password-code/forgot-password-code.page';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import {
  IonContent,
  IonGrid,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';
import { RecoveryEmailFormComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-forgot-password-email',
  templateUrl: './forgot-password-email.page.html',
  styleUrls: ['./forgot-password-email.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonGrid,
    BackButtonComponent,
    RecoveryEmailFormComponent,
  ],
})
export class ForgotPasswordEmailPage implements OnInit, OnDestroy {
  private passwordService = inject(PasswordServiceService);
  private platform = inject(Platform);
  private ionNav = inject(IonNav);

  backNavSub: Subscription;

  ngOnInit() {
    this.backNavSub = this.platform.backButton.subscribeWithPriority(
      90,
      async () => {
        this.clickBack();
      },
    );
  }

  next(email: string) {
    this.passwordService.emailToCode = email;
    this.ionNav.push(ForgotPasswordCodePage);
  }

  clickBack() {
    this.ionNav.pop();
  }

  ngOnDestroy(): void {
    if (this.backNavSub) this.backNavSub.unsubscribe();
  }
}
