import { User } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  NotificationModel,
  NotificationsService,
} from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';
import {
  NavController,
  IonRippleEffect,
  IonAvatar,
  IonImg,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { MainService } from '../services/main.service';

import { NgClass } from '@angular/common';
import { Chat, MessagesService } from '@trokai/shared-data-access';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, sadOutline } from 'ionicons/icons';
import { AlertService, ShortDatePipe } from '@trokai/shared-ui';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonSpinner,
    IonIcon,
    IonImg,
    IonAvatar,
    IonRippleEffect,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    BackButtonComponent,
    NgClass,
    ShortDatePipe,
  ],
})
export class NotificationsPage implements OnInit {
  private notificationsService = inject(NotificationsService);
  private navCtrl = inject(NavController);
  private mainService = inject(MainService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private messagesService = inject(MessagesService);

  isLoading = true;
  user: User;

  notifications: NotificationModel[] = [];
  url = environment.imageURL;

  tab = 'Notificações';
  tabList = ['Notificações', 'Mensagens'];

  endOfSearch = false;
  skip = 0;

  chats: Chat[] = [];
  unreadMsgs = null;
  unreadNotif = null;

  ngOnInit() {
    addIcons({ sadOutline, notificationsOutline });

    this.notificationsService.resetNotif.subscribe(() => {
      this.notifications = [];
      this.endOfSearch = false;
      this.skip = 0;
      this.navCtrl.pop();
    });

    this.messagesService.notReadCount$.subscribe(
      (count) => (this.unreadMsgs = count && count > 0),
    );

    this.notificationsService.notReadedCount$.subscribe(
      (count) => (this.unreadNotif = count && count > 0),
    );

    this.messagesService.chats$.subscribe((chats) => (this.chats = chats));
    this.authService.user$.subscribe((u) => (this.user = u));
    this.startNotifications();
  }

  async startNotifications() {
    try {
      await this.fetchNotifications();
      this.notificationsService.markAsRead();
    } finally {
      this.isLoading = false;
    }
  }

  async fetchNotifications() {
    try {
      const res = await this.notificationsService.fetchNotifications(this.skip);
      this.notifications = this.notifications.concat(res.data);
      this.skip += res.data.length;
      if (!res.meta.has_more) this.endOfSearch = true;
    } catch {
      this.endOfSearch = true;
    }
  }

  // Route the server-provided deep link to the matching mobile screen.
  open(n: NotificationModel) {
    const url = n.target_url;
    if (!url) return;
    const path = url.replace(/^\//, '');
    let m: RegExpMatchArray | null;

    if ((m = path.match(/^orders\/sales\/(.+)$/))) this.openSale(m[1]);
    else if ((m = path.match(/^orders\/purchases\/(.+)$/)))
      this.openPurchase(m[1]);
    else if ((m = path.match(/^items\/(.+)$/)))
      this.openClothes(m[1].split('-').pop());
    else if ((m = path.match(/^users\/(.+)$/))) this.openWardrobe(m[1]);
    else if (path === 'profile/products') this.openInventory();
    else if (path === 'wallet') this.openBank();
    else this.openAlert('Ops!', 'Algo deu errado.');
  }

  async doRefresh(event) {
    try {
      this.skip = 0;
      this.endOfSearch = false;
      this.notifications = [];
      await this.fetchNotifications();
    } finally {
      event.target.complete();
    }
  }

  async loadData(event) {
    try {
      await this.fetchNotifications();
    } finally {
      event.target.complete();
    }
  }

  openSale(orderId) {
    this.navCtrl.navigateForward(`/main/negotiations/sale/${orderId}`);
  }

  openPurchase(orderId) {
    this.navCtrl.navigateForward(`/main/negotiations/purchase/${orderId}`);
  }

  openClothes(clothesId) {
    this.mainService.navigateToProduct(clothesId);
  }

  openWardrobe(userId) {
    this.mainService.navigateToWardrobe(userId);
  }

  openAlert(title, msg) {
    this.alertService.showAlert(title, msg);
  }

  openBank() {
    this.navCtrl.navigateForward('/main/profile/options/bank');
  }

  openInventory() {
    this.navCtrl.navigateForward('/main/profile/inventory');
  }

  changeTab(tab) {
    this.tab = tab;
    this.isLoading = true;

    setTimeout(() => (this.isLoading = false), 200);
  }

  openChat(chat: Chat) {
    // abre passando o chat
    if (chat.negotiationType === 'purchase')
      this.navCtrl.navigateForward(
        `/main/negotiations/purchase/${chat.negotiationId}/true`,
      );
    else if (chat.negotiationType === 'sale')
      this.navCtrl.navigateForward(
        `/main/negotiations/sale/${chat.negotiationId}/true`,
      );
    else
      this.alertService.showAlert(
        'Mensagem não encontrada',
        'Essa mensagem pertence a uma versão antiga do Trokaí',
      );
  }

  getOtherAvatar(chat: Chat) {
    if (chat.otherUser.avatar && chat.otherUser.avatar != '') {
      return (
        environment.imageURL +
        chat.otherUser._id +
        '/avatar/' +
        chat.otherUser.avatar
      );
    } else {
      return environment.defaultAvatar1;
    }
  }
}
