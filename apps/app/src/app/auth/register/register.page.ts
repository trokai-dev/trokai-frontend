import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '@trokai/shared-data-access';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonNav,
  Platform,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import {
  AlertService,
  LoadingService,
  RegisterCredentials,
  RegisterFormComponent,
} from '@trokai/shared-ui';
import { FirebaseService } from 'src/app/services/firebase.service';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    BackButtonComponent,
    RegisterFormComponent,
  ],
})
export class RegisterPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private loadingService = inject(LoadingService);
  private ionNav = inject(IonNav);
  private platform = inject(Platform);
  private firebaseService = inject(FirebaseService);
  private completingInfoService = inject(CompletingInformationService);

  loading = false;
  emailRegistered = false;
  backNavSub: Subscription;

  ngOnInit() {
    this.firebaseService.log('AUTH_ABRIU_CADASTRO');

    this.authService.logged$.subscribe((logged) => {
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

  async checkMail(email: string) {
    this.emailRegistered = await this.userService.emailRegistered(email);
  }

  async onRegister({ name, email, password }: RegisterCredentials) {
    if (this.loading) return;

    try {
      this.loading = true;
      this.loadingService.start('Fazendo cadastro');
      await this.authService.register(name, email, password);
      this.router.navigateByUrl('/main/home', { replaceUrl: true });
      this.firebaseService.log('AUTH_CADASTRO_REALIZADO');
    } catch (error) {
      this.alertService.showAlert('Falha ao cadastrar', error.error);
    } finally {
      this.loading = false;
      this.loadingService.finish();
    }
  }

  toLogin() {
    this.ionNav.pop();
  }

  clickBack() {
    this.ionNav.pop();
  }

  ngOnDestroy() {
    if (this.backNavSub) this.backNavSub.unsubscribe();
  }
}
