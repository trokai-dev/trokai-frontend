import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@trokai/shared-core';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
import { BalanceModel, BankAccountModel, TransferStatus } from './bank.models';

@Injectable({ providedIn: 'root' })
export class BankService {
  private http = inject(HttpClient);
  private urlApi = inject(APP_CONFIG).urlApi;
  private _balance = new BehaviorSubject<BalanceModel | null>(null);

  get balance$() {
    return this._balance.asObservable();
  }

  fetchAccount() {
    return lastValueFrom(
      this.http.get<BankAccountModel>(`${this.urlApi}/users/me/bank-account`),
    );
  }

  saveAccount(account: BankAccountModel) {
    return lastValueFrom(
      this.http.patch<BankAccountModel>(
        `${this.urlApi}/users/me/bank-account`,
        account,
      ),
    );
  }

  fetchBalance() {
    return this.http
      .get<BalanceModel>(`${this.urlApi}/payments/balance/me`)
      .pipe(tap((balance) => this._balance.next(balance)));
  }

  fetchPagarmeDocumentsURL() {
    return lastValueFrom(
      this.http.get<{ url: string; qrCode: string; expiresAt: Date }>(
        `${this.urlApi}/payments/documents-url`,
      ),
    );
  }

  getGatewayStatusString(status: TransferStatus) {
    switch (status) {
      case TransferStatus.PENDING:
        return 'Aguardando';
      case TransferStatus.BANK_PROCESSING:
        return 'Processando';
      case TransferStatus.DONE:
        return 'Efetuado';
      case TransferStatus.CANCELLED:
        return 'Cancelado';
      case TransferStatus.FAILED:
        return 'Falhou';
    }
  }

  confirmWithdrawal() {
    return lastValueFrom(
      this.http
        .post<BankAccountModel>(`${this.urlApi}/payments/transfer/me`, {})
        .pipe(tap(() => this.fetchBalance().subscribe())),
    );
  }
}
