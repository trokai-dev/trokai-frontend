import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskPipe } from 'ngx-mask';
import { PhoneOtpMethod, StorageService } from '@trokai/shared-core';
import { UserService } from '@trokai/shared-data-access';
import { AlertService } from '../../alert/alert.service';
import { LoadingService } from '../../loading/loading.service';

/** Data passed by the opener into the shared dialog. */
export interface PhoneVerifyData {
  phone: string;
  smsAvailable: boolean;
  whatsappAvailable: boolean;
}

@Component({
  selector: 'tk-phone-verify-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    NgxMaskPipe,
  ],
  templateUrl: './phone-verify-dialog.component.html',
  styleUrls: ['./phone-verify-dialog.component.scss'],
})
export class PhoneVerifyDialogComponent implements OnInit, OnDestroy {
  private readonly storageKey = 'phoneVerificationLastSentTime';
  private readonly intervalToResend = 60000; // 1 minute

  private dialogData = inject<PhoneVerifyData>(MAT_DIALOG_DATA);

  phone = this.dialogData.phone ?? '';
  smsAvailable = this.dialogData.smsAvailable;
  whatsappAvailable = this.dialogData.whatsappAvailable;

  code = '';
  sentCode = false;
  otpMethod: PhoneOtpMethod = PhoneOtpMethod.WHATSAPP;
  PhoneOtpMethod = PhoneOtpMethod;

  lastSentTime: Date | null = null;
  secondsUntilResend = 0;
  private _ticker: ReturnType<typeof setInterval> | null = null;

  private storage = inject(StorageService);
  private userService = inject(UserService);
  private alert = inject(AlertService);
  private loading = inject(LoadingService);
  private dialogRef = inject(MatDialogRef<PhoneVerifyDialogComponent>);

  get canResend() {
    return this.secondsUntilResend === 0;
  }

  async ngOnInit() {
    if (!this.smsAvailable && !this.whatsappAvailable) {
      this.alert.error(
        'Nenhum método de envio de código OTP está disponível no momento. Por favor, tente novamente mais tarde.',
      );
      this.dialogRef.close();
      return;
    }

    const stored = await this.storage.get(this.storageKey);
    if (stored) {
      this.lastSentTime = new Date(stored);
      if (Date.now() - this.lastSentTime.getTime() > this.intervalToResend) {
        this.lastSentTime = null;
        await this.storage.remove(this.storageKey);
      } else {
        this.sentCode = true;
        this._startTicker();
      }
    }
  }

  ngOnDestroy() {
    this._clearTicker();
  }

  onAction() {
    if (this.sentCode) this.verifyCode(this.code);
    else this.sendVerification();
  }

  async sendVerification() {
    if (!this.canResend) return;

    this.loading.start('Enviando código...');
    try {
      await this.userService.sendPhoneOtp(this.otpMethod);
      this.sentCode = true;
      this.lastSentTime = new Date();
      await this.storage.set(this.storageKey, this.lastSentTime.toISOString());
      this._startTicker();
    // eslint-disable-next-line no-empty
    } catch {} finally {
      this.loading.finish();
    }
  }

  async verifyCode(code: string) {
    this.loading.start('Verificando código...');
    try {
      await this.userService.verifyPhoneOtp(code);
      this.alert.success('Telefone verificado com sucesso!');
      this._clearTicker();
      await this.storage.remove(this.storageKey);
      this.dialogRef.close({ verified: true });
    // eslint-disable-next-line no-empty
    } catch {} finally {
      this.loading.finish();
    }
  }

  private _startTicker() {
    this._clearTicker();
    if (!this.lastSentTime) return;
    this._updateSecondsUntilResend();
    this._ticker = setInterval(() => this._updateSecondsUntilResend(), 1000);
  }

  private _updateSecondsUntilResend() {
    if (!this.lastSentTime) {
      this.secondsUntilResend = 0;
      this._clearTicker();
      return;
    }
    const remaining =
      this.intervalToResend - (Date.now() - this.lastSentTime.getTime());
    this.secondsUntilResend = remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    if (this.secondsUntilResend === 0) this._clearTicker();
  }

  private _clearTicker() {
    if (this._ticker !== null) {
      clearInterval(this._ticker);
      this._ticker = null;
    }
  }
}
