import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from '@trokai/shared-ui';
import { LoadingService } from '@trokai/shared-ui';
import { MatButtonModule } from '@angular/material/button';
import { PasswordComponent } from '../password/password.component';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  standalone: true,
  imports: [PasswordComponent, MatButtonModule],
})
export class OptionsComponent implements OnInit {
  private authService = inject(AuthService);
  private alert = inject(AlertService);
  private loading = inject(LoadingService);

  hasPassword: boolean | null = null;

  ngOnInit() {
    this.checkPassword();
  }

  async checkPassword() {
    try {
      if (this.authService.hasPassword !== null)
        this.hasPassword = this.authService.hasPassword;
      else this.hasPassword = await this.authService.userHasPassword();
    } catch {
      /* intentional */
    }
  }

  async deleteAccount() {
    const res = await this.alert.question(
      'Deseja excluir a conta? Essa é uma ação irreversível',
      'Atenção',
      'Apagar conta',
      'Cancelar',
    );
    if (!res) return;

    const res2 = await this.alert.question(
      'Todos os seus dados serão apagados para sempre do Trokaí',
      'Tem certeza?',
      'Confirmar exclusão',
      'Cancelar',
    );
    if (!res2) return;

    this.loading.start();

    try {
      await this.authService.deleteAccount();
      this.authService.logout();
      this.alert.showDialog(
        'Dados apagados',
        'Todas as suas informações foram deletadas. Sua conta foi excluída do Trokaí.',
      );
    } finally {
      this.loading.finish();
    }
  }
}
