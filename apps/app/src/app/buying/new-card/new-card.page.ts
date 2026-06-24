import { Component, OnInit, inject } from '@angular/core';
import { NavController, NavParams, IonNav } from '@ionic/angular/standalone';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TkCardFormComponent } from '@trokai/shared-ui';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { AuthService } from 'src/app/services/auth.service';
import { User } from '@trokai/shared-core';

@Component({
  selector: 'app-new-card',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    BackButtonComponent,
    TkCardFormComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar mode="ios">
        <ion-buttons slot="start"><app-back-button /></ion-buttons>
        <ion-title>Novo cartão</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="p-24">
        <tk-card-form [user]="user" (saved)="onSaved()" />
      </div>
    </ion-content>
  `,
})
export class NewCardPage implements OnInit {
  user: User;
  buying = false;

  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private navParams = inject(NavParams, { optional: true });
  private ionNav = inject(IonNav, { optional: true });

  ngOnInit() {
    this.authService.user$.subscribe((u) => (this.user = u));
    this.buying = this.navParams?.data?.buying ?? false;
  }

  onSaved() {
    if (this.buying && this.ionNav) {
      this.ionNav.pop();
    } else {
      this.navCtrl.back();
    }
  }
}
