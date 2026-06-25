import { HttpErrorResponse } from '@angular/common/http';
import { NavController } from '@ionic/angular/standalone';
import { Injectable, inject } from '@angular/core';
import { Network } from '@capacitor/network';
import { BaseAuthInterceptor, FeedbackService } from '@trokai/shared-core';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from '@trokai/shared-ui';

@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptor extends BaseAuthInterceptor {
  private feedback = inject(FeedbackService);
  private alertService = inject(AlertService);
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);

  protected token(): string | undefined {
    return this.authService.getUserValue()?.token;
  }

  protected onErrorCode(code: string, error: HttpErrorResponse): void {
    if (code === 'update_app') {
      this.navCtrl.navigateRoot('/blocked/outdated');
    } else if (code === 'banned') {
      this.navCtrl.navigateRoot('/blocked/banned');
    } else if (code === 'token_expired') {
      this.authService.logout();
    } else if (code === 'apple_deleted') {
      this.authService.logout();
      this.alertService.showAlert('Conta excluída', error.error.message);
    } else if (code === 'apple_token') {
      this.authService.logout();
      this.alertService.showAlert('Sessão expirada', error.error.message);
    }
  }

  protected async showError(message: string | null): Promise<void> {
    const networkStatus = await Network.getStatus();
    if (!networkStatus.connected) {
      this.feedback.error('Sem conexão');
    } else if (message && message.toString().length > 0) {
      this.feedback.error(message);
    } else {
      this.feedback.error('Ops! Algo deu errado!');
    }
  }
}
