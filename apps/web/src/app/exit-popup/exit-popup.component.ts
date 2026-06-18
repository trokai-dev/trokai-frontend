import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MarketingService } from '../services/marketing.service';
import { AlertService } from '@trokai/shared-ui';

enum ExitReasons {
  TAMANHO = 'tamanho',
  PRECOS = 'precos',
  UX = 'ux',
  PRODUTOS = 'produtos',
  OUTRO = 'outro',
}

@Component({
  selector: 'app-exit-popup',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './exit-popup.component.html',
  styleUrl: './exit-popup.component.scss',
})
export class ExitPopupComponent {
  private dialogRef = inject(MatDialogRef<ExitPopupComponent>);
  private marketingService = inject(MarketingService);
  private alert = inject(AlertService);

  selection: {
    reason: ExitReasons;
    text: string;
    placeholder?: string;
  } | null = null;

  reasons = [
    {
      reason: ExitReasons.TAMANHO,
      text: 'Não tem meu tamanho',
      placeholder: 'Qual o seu tamanho?',
    },
    {
      reason: ExitReasons.PRECOS,
      text: 'Preços altos',
      placeholder: 'Qual o preço ideal para você?',
    },
    {
      reason: ExitReasons.UX,
      text: 'Dificuldade para navegar no site',
      placeholder: 'Como podemos melhorar?',
    },
    {
      reason: ExitReasons.PRODUTOS,
      text: 'Não encontrei o que procurava',
      placeholder: 'O que você procura?',
    },
    {
      reason: ExitReasons.OUTRO,
      text: 'Outro',
      placeholder: 'Como podemos melhorar?',
    },
  ];

  form = new FormGroup({
    message: new FormControl(''),
    email: new FormControl(
      '',
      Validators.compose([Validators.email, Validators.required]),
    ),
  });

  async next() {
    if (!this.form.valid || !this.selection) return;

    await this.marketingService.saveExitReason(
      this.selection.reason,
      this.form.value.message ?? '',
      this.form.value.email ?? '',
    );

    this.dialogRef.close();
    this.alert.showDialog('Obrigado pela resposta!', 'Utilize o cupom 10OFF.');
  }

  back() {
    this.selection = null;
    this.form.reset();
  }
}
