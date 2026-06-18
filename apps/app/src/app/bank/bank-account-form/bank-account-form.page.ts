import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TkBankAccountFormComponent } from '@trokai/shared-ui';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

@Component({
  selector: 'app-bank-account-form',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonTitle, IonContent,
    BackButtonComponent,
    TkBankAccountFormComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar mode="ios">
        <ion-buttons slot="start"><app-back-button defaultHref="/main/profile/options/bank" /></ion-buttons>
        <ion-title>Conta bancária</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content><div class="p-24"><tk-bank-account-form (saved)="onSaved()" /></div></ion-content>
  `,
})
export class BankAccountFormPage {
  private router = inject(Router);

  onSaved() {
    this.router.navigate(['/main/profile/options/bank/withdraw']);
  }
}
