import { User } from '@trokai/shared-core';
import { AfterViewInit, Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '@trokai/shared-data-access';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import {
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
  LoadingController,
  NavController,
} from '@ionic/angular/standalone';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import {
  PhoneVerifyDialogComponent,
  ProfileFormComponent,
  ProfileFormValue,
} from '@trokai/shared-ui';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { ToastService } from '../services/toast-service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    BackButtonComponent,
    ProfileFormComponent,
  ],
})
export class ProfilePage implements AfterViewInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private loadingCtrl = inject(LoadingController);
  private router = inject(Router);
  private completingInfoService = inject(CompletingInformationService);
  private navCtrl = inject(NavController);
  private dialog = inject(MatDialog);
  private globalService = inject(GlobalService);

  user: User;
  loading = false;
  emailRegistered = false;
  phoneRegistered = false;

  completingInformation = false;
  phoneVerifying = false;
  promptedPhoneVerification = false;

  ngAfterViewInit() {
    this.user = this.authService.getUserValue();
    if (!this.user) return;

    this.completingInformation = this.router.url === '/profile-completing';
    this.phoneVerifying = this.router.url === '/phone-verification';

    if (
      this.phoneVerifying &&
      !this.user.phoneVerified &&
      !this.promptedPhoneVerification
    ) {
      this.verifyPhone();
    }
  }

  async save(value: ProfileFormValue) {
    const _user = new User();
    _user.name = value.name;
    _user.email = value.email;
    _user.cpf = value.cpf;
    _user.phone = value.phone;
    _user.birthday = value.birthday;

    if (this.user.inPerson == null) _user.inPerson = false;
    if (this.user.shipping == null) _user.shipping = false;

    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    loading.present();

    try {
      await this.authService.updateUser(_user);

      if (this.completingInformation) {
        this.completingInfoService.next();
      } else {
        this.navCtrl.pop();
      }
      this.toastService.makeToast('Dados atualizados!');
    } catch {
      // updateUser surfaces its own error
    } finally {
      loading.dismiss();
    }
  }

  async checkMail(email: string) {
    if (this.user.email == email) {
      this.emailRegistered = false;
      return;
    }
    this.emailRegistered = await this.userService.emailRegistered(email);
  }

  async checkPhone(phone: string) {
    if (this.user.phone == phone) {
      this.phoneRegistered = false;
      return;
    }
    this.phoneRegistered = await this.userService.phoneRegistered(phone);
  }

  async verifyPhone() {
    this.promptedPhoneVerification = true;

    const params = this.globalService.getParamsValue();
    const dialogRef = this.dialog.open(PhoneVerifyDialogComponent, {
      panelClass: 'dialog-phone-verify',
      data: {
        phone: this.authService.getUserValue()?.phone ?? '',
        smsAvailable: !!params?.smsOtp,
        whatsappAvailable: !!params?.whatsappOtp,
      },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result || !result.verified) return;

    await this.authService.syncUserData();
    if (this.phoneVerifying) this.completingInfoService.next();
  }
}
