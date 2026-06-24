import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { RouterLink } from '@angular/router';
import {
  LoadingController,
  NavController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonIcon,
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cardOutline,
  cashOutline,
  chevronForward,
  locationOutline,
  lockClosedOutline,
  personOutline,
  storefrontOutline,
  trashOutline,
} from 'ionicons/icons';
import { AlertService } from '@trokai/shared-ui';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonIcon,
    IonRippleEffect,
    BackButtonComponent,
    RouterLink,
  ],
})
export class OptionsPage implements OnInit {
  hasPassword = null;
  user = null;

  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);
  private navCtrl = inject(NavController);
  private alertService = inject(AlertService);
  private loadingCtrl = inject(LoadingController);

  constructor() {
    addIcons({
      personOutline,
      chevronForward,
      storefrontOutline,
      cardOutline,
      locationOutline,
      cashOutline,
      lockClosedOutline,
      trashOutline,
    });
  }

  async ngOnInit() {
    this.authService.user$.subscribe((u) => {
      if (u) this.user = u;
    });

    if (this.authService.hasPassword !== null)
      this.hasPassword = this.authService.hasPassword;
    else this.hasPassword = await this.authService.userHasPassword();
  }

  async askDelete() {
    const answer1 = await this.alertService.askQuestion(
      'Atenção',
      'Deseja excluir a conta?',
    );

    if (answer1) {
      const answer2 = await this.alertService.askQuestion(
        'Tem certeza?',
        'Todos os seus dados serão apagados para sempre do Trokaí.',
        'Apagar',
        'Cancelar',
      );
      if (answer2) this.deleteAccount();
    }
  }

  async deleteAccount() {
    this.firebaseService.log('APAGAR_CONTA');

    const loading = await this.loadingCtrl.create({
      message: 'Apagando seus dados...',
    });

    loading.present();

    try {
      await this.authService.deleteAccount();
      this.alertService.showAlert(
        'Dados apagados',
        'Todas as suas informações foram deletadas. Sua conta foi excluída do Trokaí.',
      );
    } finally {
      loading.dismiss();
    }
  }

  async bank() {
    this.navCtrl.navigateForward('/main/profile/options/bank');
  }

  async cards() {
    this.navCtrl.navigateForward('/main/profile/options/cards');
    this.firebaseService.log('MENU_ABRIU_CARTOES');
  }
}
