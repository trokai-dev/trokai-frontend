import { User } from '@trokai/shared-core';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { TkImagePickerComponent } from '@trokai/shared-ui';
import { firstValueFrom } from 'rxjs';
import {
  LoadingController,
  NavController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonSpinner,
} from '@ionic/angular/standalone';
import { SellerProfileComponent, SellerProfileValue } from '@trokai/shared-ui';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { ToastService } from '../services/toast-service';

@Component({
  selector: 'app-store-options',
  templateUrl: './store-options.page.html',
  styleUrls: ['./store-options.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonGrid,
    BackButtonComponent,
    SellerProfileComponent,
    TkImagePickerComponent,
  ],
})
export class StoreOptionsPage implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private loadingCtrl = inject(LoadingController);
  private router = inject(Router);
  private completingInfoService = inject(CompletingInformationService);
  private navCtrl = inject(NavController);

  user: User;
  pictureUpdating = false;
  completingInformation = false;

  ngOnInit() {
    this.user = this.authService.getUserValue();
    if (!this.user) return;
    this.completingInformation = this.router.url === '/store-completing';
  }

  getUserAvatar() {
    if (this.user.avatar && this.user.avatar != '')
      return (
        environment.imageURL + this.user._id + '/avatar/' + this.user.avatar
      );
    return environment.defaultAvatar;
  }

  async onImagePicked(blob: Blob | null) {
    this.pictureUpdating = true;

    if (blob === null) {
      try {
        await firstValueFrom(
          this.http.delete(environment.urlApi + '/users/me/avatar'),
        );
        this.authService.syncAvatar(null);
        this.toastService.makeToast('Foto de perfil removida');
      } finally {
        this.pictureUpdating = false;
      }
      return;
    }

    try {
      await this.authService.uploadAvatar(blob);
      this.toastService.makeToast('Foto de perfil atualizada');
    } finally {
      this.pictureUpdating = false;
    }
  }

  async save(value: SellerProfileValue) {
    const _user = new User();
    _user.inPerson = value.inPerson;
    _user.shipping = value.shipping;
    _user.storeName = value.storeName;
    _user.nickname = value.nickname;
    _user.storeVisibility = value.storeVisibility;

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
}
