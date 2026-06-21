import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderStatus, OrderStatusString } from '@trokai/shared-core';
import { BalanceModel, BankService } from '@trokai/shared-data-access';
import { UserService } from '@trokai/shared-data-access';
import {
  PagarMeKycDetailsStatus,
  PagarMeRecipientStatus,
  User,
} from '@trokai/shared-core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonButtons,
  IonContent,
  IonGrid,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRippleEffect, IonIcon, IonList, IonSpinner } from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import { informationCircleOutline, sadOutline } from 'ionicons/icons';
import { AlertService, CostPipe } from '@trokai/shared-ui';
import { TutorialService } from '../services/tutorial.service';
import { GlobalService } from '../services/global.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.page.html',
  styleUrls: ['./bank.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    IonSpinner, IonList, IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonGrid,
    BackButtonComponent,
    CurrencyPipe,
    DatePipe,
    CostPipe,
  ],
})
export class BankPage implements OnInit, OnDestroy {
  isLoading = true;
  balance: BalanceModel;

  ordersAndTransfers = [];

  user: User;

  docsPending = false;
  docsRefused = false;
  shouldVerify = false;
  allGood = false;
  docsUrl = null;

  stateSubs: Subscription;

  private tutorialService = inject(TutorialService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bankService = inject(BankService);
  private alert = inject(AlertService);
  private userService = inject(UserService);
  private globalService = inject(GlobalService);

  constructor() {
    addIcons({ informationCircleOutline, sadOutline });
  }

  async ngOnInit() {
    this.tutorialService.bankPresentation();
    this.bankService.balance.subscribe((balance) => {
      if (!balance) return;
      this.balance = balance;
      this.mountList();
    });

    this.stateSubs = this.globalService.onAppStateChange.subscribe((state) => {
      // when user comes back to the app after verifying documents
      if (state.isActive) this.load();
    });
  }

  async mountList() {
    const orders = [];
    const transfers = [];

    for (const t of this.balance.transfers) {
      const obj = {
        title: 'Saque',
        date: t.createdAt,
        text: this.bankService.getGatewayStatusString(t.status),
        amount: t.amount,
        items: t.ordersIds.map((id) => {
          const order = this.balance.orders?.find((o) => o._id === id);
          return order?.items.map((item) => (item.description + (item.refund ? ' (Estornado)' : '')));
        }),
      };

      transfers.push(obj);
    }

    for (const t of this.balance.orders) {
      const obj = {
        title: 'Venda',
        text: OrderStatusString[t.status],
        date: t.createdAt,
        items: t.items.map((item) => (item.description + (item.refund ? ' (Estornado)' : ''))),
        amount: t.sellerProfit,
        transferAt: this.checkOrderTransferAt(t),
      };

      orders.push(obj);
    }

    const auxList = [].concat(orders, transfers);
    // sort created at more recent
    auxList.sort((a, b) => (a.date < b.date ? 1 : -1));

    this.ordersAndTransfers = auxList;
  }

  checkOrderTransferAt(order) {
    const notTransfered =
      this.balance.transfers.filter((t) => t.ordersIds.includes(order._id))
        .length === 0;

    const statusMatch = [
      OrderStatus.PAYMENT_APPROVED,
      OrderStatus.WAITING_SHIPMENT,
      OrderStatus.WAITING_WITHDRAWAL,
      OrderStatus.ORDER_SENT,
      OrderStatus.ORDER_DELIVERED,
      OrderStatus.WAITING_REVIEW,
      OrderStatus.CONCLUDED,
    ].includes(order.status);

    if (statusMatch && notTransfered) return order.transferAt;
    return null;
  }

  alertSaqueIndisponivel() {
    this.alert.showAlert(
      'Saldo insuficiente',
      'Não há saldo disponível para saque.',
    );
  }

  alertSaquePrevisao() {
    this.alert.showAlert(
      'Previsão de saque',
      'O valor de uma venda é liberado 10 dias úteis após o recebimento do produto pelo comprador.',
    );
  }

  ionViewDidEnter() {
    this.load();
  }

  async load() {
    this.bankService.fetchBalance().subscribe();

    try {
      this.isLoading = true;

      const user = await this.userService.getUserInfo();
      const { pagarMeRecipientStatus, pagarMeKycDetailsStatus } = user;

      const _recipient = PagarMeRecipientStatus;
      const _kyc = PagarMeKycDetailsStatus;

      this.allGood = pagarMeRecipientStatus === _recipient.ACTIVE;
      this.docsRefused = pagarMeRecipientStatus === _recipient.REFUSED;

      this.docsPending =
        pagarMeRecipientStatus === _recipient.AFFILIATION &&
        pagarMeKycDetailsStatus === _kyc.PENDING;

      this.shouldVerify =
        pagarMeRecipientStatus === _recipient.AFFILIATION &&
        pagarMeKycDetailsStatus === _kyc.PARTIALLY_DENIED;

      if (this.shouldVerify)
        this.docsUrl = (await this.bankService.fetchPagarmeDocumentsURL()).url;
    } finally {
      this.isLoading = false;
    }
  }

  async withdraw() {
    if (this.allGood && this.balance.saldoDisponivel > 0) {
      this.router.navigate(['bank-account'], { relativeTo: this.route });
    }
  }

  ngOnDestroy(): void {
    this.stateSubs?.unsubscribe();
  }
}
