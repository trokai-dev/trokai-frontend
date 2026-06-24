import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  OrderStatus,
  OrderStatusString,
  PagarMeKycDetailsStatus,
  PagarMeRecipientStatus,
} from '@trokai/shared-core';
import { BalanceModel, BankService, UserService } from '@trokai/shared-data-access';
import { AlertService, CostPipe } from '@trokai/shared-ui';

export interface BankMovement {
  title: string;
  date: Date;
  text?: string;
  amount: number;
  items?: string[];
  transferAt?: Date | null;
}

/**
 * Shared bank/cofrinho CONTENT (canonical web flow). Presentational + own
 * balance/movements fetch via BankService; the platform shell only handles
 * page chrome and opening the Pagar.me doc-verification URL (`openDocsUrl`)
 * through its platform's browser API.
 */
@Component({
  selector: 'tk-bank',
  standalone: true,
  imports: [
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CurrencyPipe,
    CostPipe,
    DatePipe,
    NgClass,
  ],
  templateUrl: './tk-bank.component.html',
  styleUrl: './tk-bank.component.scss',
})
export class TkBankComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bankService = inject(BankService);
  private alert = inject(AlertService);
  private userService = inject(UserService);

  @Output() openDocsUrl = new EventEmitter<string>();

  isLoading = true;
  balance!: BalanceModel;
  movements: BankMovement[] = [];

  ngOnInit() {
    this.bankService.fetchBalance().subscribe();

    this.bankService.balance$.subscribe((balance) => {
      if (!balance) return;
      this.balance = balance;
      this.mountList();
      this.isLoading = false;
    });
  }

  private mountList() {
    const transfers: BankMovement[] = this.balance.transfers.map((t) => ({
      title: 'Saque',
      date: t.createdAt,
      text: this.bankService.getGatewayStatusString(t.status),
      amount: t.amount,
      items: t.ordersIds
        .map((id) => this.balance.orders?.find((o) => o._id === id))
        .filter((o) => !!o)
        .flatMap((o) =>
          o.items.map(
            (item) => item.description + (item.refund ? ' (Estornado)' : ''),
          ),
        ),
    }));

    const orders: BankMovement[] = this.balance.orders.map((t) => ({
      title: 'Venda',
      text: '(' + OrderStatusString[t.status] + ')',
      date: t.createdAt,
      items: t.items.map(
        (item) => item.description + (item.refund ? ' (Estornado)' : ''),
      ),
      amount: t.sellerProfit,
      transferAt: this.checkOrderTransferAt(t),
    }));

    this.movements = [...orders, ...transfers].sort((a, b) =>
      a.date < b.date ? 1 : -1,
    );
  }

  private checkOrderTransferAt(order: {
    _id: string;
    status: OrderStatus;
    transferAt?: Date;
  }) {
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

    return statusMatch && notTransfered ? order.transferAt : null;
  }

  alertSaqueIndisponivel() {
    this.alert.showDialog(
      'Saldo insuficiente',
      'Não há saldo disponível para saque.',
    );
  }

  alertSaquePrevisao() {
    this.alert.showDialog(
      'Previsão de saque',
      'O valor de uma venda é liberado 10 dias úteis após o recebimento do produto pelo comprador.',
    );
  }

  async withdraw() {
    if (this.balance.saldoDisponivel <= 0) {
      this.alertSaqueIndisponivel();
      return;
    }

    const user = await this.userService.getUserInfo();

    const active =
      user.pagarMeRecipientStatus === PagarMeRecipientStatus.ACTIVE;
    const denied =
      user.pagarMeRecipientStatus === PagarMeRecipientStatus.REFUSED;
    const affiliate =
      user.pagarMeRecipientStatus === PagarMeRecipientStatus.AFFILIATION;
    const pending =
      user.pagarMeKycDetailsStatus === PagarMeKycDetailsStatus.PENDING;
    const partiallyDenied =
      user.pagarMeKycDetailsStatus === PagarMeKycDetailsStatus.PARTIALLY_DENIED;

    if (active) {
      this.router.navigate(['withdraw'], { relativeTo: this.route });
      return;
    }

    if (denied) {
      this.alert.showDialog(
        'Documentação recusada',
        'Por favor, entre em contato com a nossa equipe.',
      );
      return;
    }

    if (affiliate && pending) {
      this.alert.showDialog(
        'Documentação em análise',
        'A análise dos documentos pode levar até 24 horas.',
      );

      return;
    }

    if (affiliate && partiallyDenied) {
      const proceed = await this.alert.question(
        'Para liberar o saque com segurança, precisamos verificar a sua identidade. Deseja realizar a verificação agora?',
        'Verificação de conta',
        'Iniciar verificação',
        'Cancelar',
      );

      if (!proceed) return;
      const docs = await this.bankService.fetchPagarmeDocumentsURL();
      if (docs) this.openDocsUrl.emit(docs.url);
    }
  }
}
