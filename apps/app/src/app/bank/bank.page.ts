import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BankService } from '@trokai/shared-data-access';
import { TkBankComponent } from '@trokai/shared-features';
import { Browser } from '@capacitor/browser';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { TutorialService } from '../services/tutorial.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-bank',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    BackButtonComponent,
    TkBankComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar mode="ios">
        <ion-buttons slot="start">
          <app-back-button defaultHref="/main/profile"></app-back-button>
        </ion-buttons>
        <ion-title>Cofrinho</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="p-24">
        <tk-bank (openDocsUrl)="openDocsUrl($event)" />
      </div>
    </ion-content>
  `,
})
export class BankPage implements OnInit, OnDestroy {
  private tutorialService = inject(TutorialService);
  private bankService = inject(BankService);
  private globalService = inject(GlobalService);

  private stateSubs?: Subscription;

  ngOnInit() {
    this.tutorialService.bankPresentation();

    this.stateSubs = this.globalService.onAppStateChange.subscribe((state) => {
      // when user comes back to the app after verifying documents
      if (state.isActive) this.bankService.fetchBalance().subscribe();
    });
  }

  ionViewDidEnter() {
    this.bankService.fetchBalance().subscribe();
  }

  openDocsUrl(url: string) {
    Browser.open({ url });
  }

  ngOnDestroy(): void {
    this.stateSubs?.unsubscribe();
  }
}
