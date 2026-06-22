import { Component, OnInit, inject } from '@angular/core';
import {
  LoadingController,
  NavController,
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { BuyingService } from '@trokai/shared-data-access';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';

import {
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cardOutline,
  sadOutline,
  trashOutline,
} from 'ionicons/icons';
import { AlertService } from '@trokai/shared-ui';
import { FirebaseService } from '../services/firebase.service';
import { ToastService } from '../services/toast-service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
  standalone: true,
  imports: [
    IonRippleEffect,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    BackButtonComponent,
  ],
})
export class CardsPage implements OnInit {
  cards = [];

  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);
  private navCtrl = inject(NavController);
  private buyingService = inject(BuyingService);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);
  private loadingCtrl = inject(LoadingController);

  constructor() {
    addIcons({
      addOutline,
      trashOutline,
      cardOutline,
      sadOutline,
    });
  }

  ngOnInit() {
    this.authService.user.subscribe((user) => {
      this.cards = [...user.cards];
    });
  }

  async delete(card) {
    const resp = await this.alertService.askQuestion(
      'Excluir cartão?',
      'Essa ação não pode ser desfeita',
    );
    if (!resp) return;

    const loading = await this.loadingCtrl.create({
      message: 'Apagando cartão',
    });
    loading.present();

    try {
      await this.buyingService.deleteCard(card);
      this.toastService.makeToast('Cartão apagado!');
    } finally {
      loading.dismiss();
    }
  }

  newCard() {
    this.firebaseService.log('MENU_ADD_CARD');
    this.navCtrl.navigateForward('/main/profile/options/cards/new');
  }
}
