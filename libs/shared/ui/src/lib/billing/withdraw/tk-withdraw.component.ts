import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { BalanceModel, BankService } from '@trokai/shared-data-access';
import { AlertService } from '../../alert/alert.service';
import { CostPipe } from '../../pipes/cost.pipe';
import { LoadingService } from '../../loading/loading.service';
import { TkBankAccountFormComponent } from '../bank-account-form/tk-bank-account-form.component';

@Component({
  selector: 'tk-withdraw',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDividerModule,
    CurrencyPipe,
    CostPipe,
    TkBankAccountFormComponent,
  ],
  templateUrl: './tk-withdraw.component.html',
  styleUrl: './tk-withdraw.component.scss',
})
export class TkWithdrawComponent implements OnInit {
  balance!: BalanceModel;
  @Input() gatewayWithdrawFee = 0;

  @Output() done = new EventEmitter<void>();

  private bankService = inject(BankService);
  private loading = inject(LoadingService);
  private alert = inject(AlertService);

  ngOnInit() {
    this.bankService.balance.subscribe((balance) => {
      if (balance) this.balance = balance;
    });
  }

  hasEnough() {
    return this.balance?.saldoDisponivel > this.gatewayWithdrawFee;
  }

  async confirm() {
    if (!this.hasEnough()) return;
    this.loading.start();
    try {
      await this.bankService.confirmWithdrawal();
      this.alert.showDialog(
        'Saque solicitado',
        'Você deve receber o valor em até 1 dia útil.',
      );
      this.done.emit();
    } finally {
      this.loading.finish();
    }
  }
}
