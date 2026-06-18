import { User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService, ShortDatePipe } from '@trokai/shared-ui';
import { GlobalService } from 'src/app/services/global.service';
import { Chat } from '@trokai/shared-data-access';
import {
  NotificationsService,
  NotificationModel,
  NotificationType,
} from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';

import { Router } from '@angular/router';
import { NotificationDisplay } from '@trokai/shared-core';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NgClass],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss',
})
export class NotificationsListComponent implements OnInit {
  private globalService = inject(GlobalService);
  private notificationsService = inject(NotificationsService);
  private authService = inject(AuthService);
  private shortDatePipe = inject(ShortDatePipe);
  private currency = inject(CurrencyPipe);
  private router = inject(Router);
  private alert = inject(AlertService);

  notifications: NotificationDisplay[] = [];

  user!: User;
  url = environment.imageURL;

  tab = 'Notificações';
  tabList = ['Notificações', 'Mensagens'];

  chats: Chat[] = [];
  unreadNotif = false;

  constructor() {
    this.globalService.setTitle('Notificações');
  }

  ngOnInit() {
    this.notificationsService.notReadedCount$.subscribe(
      (count) => (this.unreadNotif = (count ?? 0) > 0),
    );

    this.authService.user.subscribe((u) => {
      if (u) this.user = u;
    });
    this.startNotifications();
  }

  async startNotifications() {
    try {
      const notif = await this.notificationsService.fetchNotifications(0);
      this.notifications = this.mountNotifications(notif);
      this.notificationsService.markAsRead();
    } finally {
      /* intentional */
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
              this.openPurchase(message.orderId);
            },
          };
        }

        case NotificationType.OrderDelivered: {
          return {
            icon: 'home-outline',
            text: 'Eba! Pedido entregue!',
            action: () => {
              this.openPurchase(message.orderId);
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
          // console.log(notification);

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
      /* intentional */
      return null;
    }
  }

  getStyle(item: { icon: { color: string } }) {
    return { 'font-size': '5vw', color: item.icon.color };
  }

  // ACTIONS
  openSale(orderId: string) {
    // this.navCtrl.navigateForward(`/main/negotiations/sale/${orderId}`);
    this.router.navigateByUrl(`/orders/sales/${orderId}`);
  }

  openPurchase(orderId: string) {
    // this.navCtrl.navigateForward(`/main/negotiations/purchase/${orderId}`);
    this.router.navigateByUrl(`/orders/purchases/${orderId}`);
  }

  openClothes(clothesId: string) {
    // this.mainService.navigateToProduct(clothesId);
    this.router.navigateByUrl(`/items/${clothesId}`);
  }

  openWardrobe(userId: string) {
    // this.mainService.navigateToWardrobe(userId);
    this.router.navigateByUrl(`/users/${userId}`);
  }

  openAlert(title: string, msg: string) {
    this.alert.showDialog(title, msg);
  }

  openBank() {
    this.router.navigateByUrl('/account/bank');
  }

  openInventory() {
    // this.navCtrl.navigateForward('/main/profile/inventory');
    this.router.navigateByUrl(`/users/${this.user._id}`);
  }
}
