import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';
import { NotificationsService } from '@trokai/shared-data-access';
import { Share } from '@capacitor/share';
import { MessagesService } from '@trokai/shared-data-access';

import {
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRippleEffect,
  IonToolbar,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  chevronForward,
  close,
  documentTextOutline,
  exitOutline,
  heartOutline,
  helpOutline,
  logoWhatsapp,
  mailOutline,
  notificationsOutline,
  personOutline,
  shareSocialOutline,
  shieldCheckmarkOutline,
  shirtOutline,
  ticketOutline,
} from 'ionicons/icons';
import { AlertService, TkUserAvatarComponent } from '@trokai/shared-ui';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-profile-tab',
  templateUrl: './profile-tab.page.html',
  styleUrls: ['./profile-tab.page.scss'],
  standalone: true,
  imports: [
    TkUserAvatarComponent,
    IonBadge,
    IonHeader,
    IonContent,
    IonGrid,
    IonIcon,
    IonRippleEffect,
    IonToolbar,
    RouterLink,
  ],
})
export class ProfileTabPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);
  private alertService = inject(AlertService);
  private mainService = inject(MainService);
  private messagesService = inject(MessagesService);
  private notificationsService = inject(NotificationsService);

  constructor() {
    addIcons({
      shirtOutline,
      chevronForward,
      notificationsOutline,
      heartOutline,
      personOutline,
      ticketOutline,
      helpOutline,
      shareSocialOutline,
      exitOutline,
      mailOutline,
      logoWhatsapp,
      cashOutline,
      documentTextOutline,
      shieldCheckmarkOutline,
      close,
    });
  }

  user = null;

  notificationCount = 0;
  messageCount = 0;

  locationString = null;

  ngOnInit() {
    this.mainService.profileTab.subscribe(() => {
      this.content.scrollToTop(400); // rola a pagina ao escolher um item
    });

    this.authService.user.subscribe((u) => (this.user = u));

    this.notificationsService.notReadedCount$.subscribe((count) => {
      this.notificationCount = count;
    });

    this.messagesService.notReadCount$.subscribe((count) => {
      this.messageCount = count;
    });
  }

  async share() {
    await Share.share({
      title: 'Trokaí',
      text: 'Conheça o app dos brechós, Trokaí. Baixe gratuitamente:',
      url: 'https://trokai.page.link/app',
      dialogTitle: 'Compartilhar',
    });

    this.firebaseService.log('SHARE_TROKAI');
  }

  async logout() {
    const answer = await this.alertService.askQuestion(
      'Logout',
      'Deseja mesmo sair dessa conta?',
    );
    if (answer) this.authService.logout();
  }
}
