import { User } from '@trokai/shared-core';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  NotificationModel,
  NotificationsService,
  NotificationType,
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

import { CurrencyPipe, NgClass } from '@angular/common';
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
import {
  alertOutline,
  cashOutline,
  chatbubbleOutline,
  checkmarkOutline,
  cubeOutline,
  heartOutline,
  homeOutline,
  notificationsOutline,
  sadOutline,
  shirtOutline,
  starOutline,
} from 'ionicons/icons';
import { AlertService, ShortDatePipe } from '@trokai/shared-ui';
import { NotificationDisplay } from '@trokai/shared-core';

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
  private shortDatePipe = inject(ShortDatePipe);
  private currency = inject(CurrencyPipe);

  isLoading = true;
  user: User;

  notifications = [];
  url = environment.imageURL;

  tab = 'Notificações';
  tabList = ['Notificações', 'Mensagens'];

  endOfSearch = false;
  skip = 0;

  chats: Chat[] = [];
  unreadMsgs = null;
  unreadNotif = null;

  ngOnInit() {
    addIcons({
      sadOutline,
      checkmarkOutline,
      alertOutline,
      starOutline,
      heartOutline,
      cashOutline,
      shirtOutline,
      chatbubbleOutline,
      cubeOutline,
      homeOutline,
      notificationsOutline,
    });

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
    this.authService.user.subscribe((u) => (this.user = u));
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
      const notif = await this.notificationsService.fetchNotifications(
        this.skip,
      );
      const mounted = this.mountNotifications(notif);
      this.notifications = this.notifications.concat(mounted);

      if (notif.length === 0) this.endOfSearch = true;

      this.skip += notif.length;
    } catch {
      this.endOfSearch = true;
    }
  }

  mountNotifications(notifications: NotificationModel[]) {
    const list = [];

    for (const n of notifications) {
      const display = this.notificationDisplay(n);
      if (!display) continue;

      const fDate = this.shortDatePipe.transform(n.createdAt);

      const item: NotificationDisplay = {
        text: display.text,
        icon: display.icon,
        action: display.action,
        read: n.read,
        type: n.type,
        date: `<label class="label-caption-1 ml-8 color-gray-light-1 nowrap">${fDate}</label>`,
      };

      list.push(item);
    }

    return list;
  }

  notificationDisplay(notification: NotificationModel) {
    const message = JSON.parse(notification.message);

    try {
      switch (notification.type) {
        // FAVORITES
        case NotificationType.FavoritesCreated: {
          return {
            icon: 'heart-outline',
            text:
              message.madeByName + ' curtiu sua peça ' + message.clothesTitle,
            action: () => {
              this.openWardrobe(message.madeById);
            },
          };
        }

        // BANK
        case NotificationType.TransferCompleted: {
          return {
            icon: 'cash-outline',
            text:
              'Saque de ' +
              this.currency.transform(message.value / 100, 'BRL', true, '1.2') +
              ' realizado.',
            action: () => {
              this.openBank();
            },
          };
        }

        // BANK
        case NotificationType.TransferFailed: {
          return {
            icon: 'alert-outline',
            text:
              'Saque de ' +
              this.currency.transform(message.value / 100, 'BRL', true, '1.2') +
              ' falhou.',
            action: () => {
              this.openBank();
            },
          };
        }

        // CLOTHES
        case NotificationType.ClothesAdjust: {
          return {
            icon: 'alert-outline',
            text:
              'O anúncio "' + message.clothesTitle + '" requer alguns ajustes.',
            action: () => {
              this.openInventory();
            },
          };
        }

        case NotificationType.ClothesApproved: {
          return {
            icon: 'shirt-outline',
            text: 'O anúncio "' + message.clothesTitle + '" foi publicado.',
            action: () => {
              this.openInventory();
            },
          };
        }

        case NotificationType.ClothesExpired: {
          return {
            icon: 'alert-outline',
            text: 'O anúncio "' + message.clothesTitle + '" expirou.',
            action: () => {
              this.openInventory();
            },
          };
        }

        case NotificationType.ClothesReproved: {
          return {
            icon: 'alert-outline',
            text:
              'O anúncio "' +
              message.clothesTitle +
              '" foi reprovado na análise.',
            action: () => {
              this.openAlert(
                'Anúncio reprovado',
                'O anúncio "' +
                  message.clothesTitle +
                  '" foi reprovado por ir contra as normas do Trokaí.',
              );
            },
          };
        }

        case NotificationType.ClothesQuestionCreated: {
          return {
            icon: 'chatbubble-outline',
            text:
              message.otherUserName +
              ' fez uma pergunta no anúncio ' +
              message.clothesTitle,
            action: () => {
              this.openClothes(message.clothesId);
            },
          };
        }

        case NotificationType.ClothesQuestionAnswered: {
          return {
            icon: 'chatbubble-outline',
            text:
              message.otherUserName +
              ' respondeu a sua pergunta no anúncio ' +
              message.clothesTitle,
            action: () => {
              this.openClothes(message.clothesId);
            },
          };
        }

        case NotificationType.OrderPaymentApprovedBuyer: {
          return {
            icon: 'cash-outline',
            text: 'Compra realizada! Seu pagamento foi aprovado.',
            action: () => {
              this.openPurchase(message.orderId);
            },
          };
        }

        case NotificationType.OrderPaymentReproved: {
          return {
            icon: 'alert-outline',
            text: 'Compra negada. Seu pagamento foi recusado.',
            action: () => {
              this.openPurchase(message.orderId);
            },
          };
        }

        case NotificationType.OrderPaymentApprovedSellerShipping: {
          return {
            icon: 'cash-outline',
            text:
              'Vendeu!!! ' +
              message.buyerName +
              ' fez uma compra no seu armário, com opção de envio pelos correios.',
            action: () => {
              this.openSale(message.orderId);
            },
          };
        }
        case NotificationType.OrderPaymentApprovedSellerInPerson: {
          return {
            icon: 'cash-outline',
            text:
              'Vendeu!!! ' +
              message.buyerName +
              ' fez uma compra no seu armário, com opção de retirada presencial.',
            action: () => {
              this.openSale(message.orderId);
            },
          };
        }

        case NotificationType.OrderSent: {
          return {
            icon: 'cube-outline',
            text:
              'Pedido a caminho! ' +
              message.sellerName +
              ' enviou o seu pedido pelos correios.',
            action: () => {
              this.openSale(message.orderId);
            },
          };
        }

        case NotificationType.OrderDelivered: {
          return {
            icon: 'home-outline',
            text: 'Eba! Pedido entregue!',
            action: () => {
              this.openSale(message.orderId);
            },
          };
        }

        case NotificationType.OrderReviewCreate: {
          if (this.user._id.toString() === message.buyerId.toString()) {
            return {
              icon: 'star-outline',
              text:
                'Avaliação pendente. Faça a avaliação de ' + message.sellerName,
              action: () => {
                this.openPurchase(message.negotiationId);
              },
            };
          } else {
            return {
              icon: 'star-outline',
              text:
                'Avaliação pendente. Faça a avaliação de ' + message.buyerName,
              action: () => {
                this.openSale(message.negotiationId);
              },
            };
          }
        }

        case NotificationType.OrderCanceled: {
          return {
            icon: 'alert-outline',
            text:
              message.madeByName +
              ' cancelou a compra. Não faça o envio do produto.',
            action: () => {
              this.openSale(message.orderId);
            },
          };
        }

        case NotificationType.OrderReviewCreatedByOtherUser: {
          if (this.user._id.toString() === message.buyerId.toString()) {
            return {
              icon: 'star-outline',
              text: message.otherUserName + ' te avaliou.',
              action: () => {
                this.openPurchase(message.negotiationId);
              },
            };
          } else {
            return {
              icon: 'star-outline',
              text: message.otherUserName + ' te avaliou.',
              action: () => {
                this.openSale(message.negotiationId);
              },
            };
          }
        }

        default: {
          console.log(notification);

          return {
            icon: 'notifications-outline',
            text: 'Notificação',
            action: () => {
              this.openAlert('Ops!', 'Algo deu errado.');
            },
          };
        }
      }
    } catch {
      return null;
    }
  }

  async doRefresh(event) {
    try {
      this.skip = 0;
      this.notifications = [];
      await this.fetchNotifications();
    } finally {
      event.target.complete();
    }
  }

  getStyle(item) {
    return { 'font-size': '5vw', color: item.icon.color };
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
