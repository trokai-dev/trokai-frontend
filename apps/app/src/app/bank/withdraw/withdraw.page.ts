import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TkWithdrawComponent } from '@trokai/shared-ui';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonTitle, IonContent,
    BackButtonComponent,
    TkWithdrawComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar mode="ios">
        <ion-buttons slot="start"><app-back-button defaultHref="/main/profile/options/bank" /></ion-buttons>
        <ion-title>Saque</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="p-24">
        <tk-withdraw [gatewayWithdrawFee]="fee" (done)="onDone()" />
      </div>
    </ion-content>
  `,
})
export class WithdrawPage implements OnInit {
  fee = 0;

  private globalService = inject(GlobalService);
  private router = inject(Router);

  ngOnInit() {
    this.globalService.params().subscribe((p) => {
      this.fee = p?.gatewayWithdrawFee ?? 0;
    });
  }

  onDone() {
    this.router.navigateByUrl('/main/profile/options/bank', { replaceUrl: true });
  }
}
