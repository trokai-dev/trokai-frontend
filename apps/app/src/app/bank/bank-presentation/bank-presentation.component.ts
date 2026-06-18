import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonGrid,
  IonLabel,
} from '@ionic/angular/standalone';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-bank-presentation',
  templateUrl: './bank-presentation.component.html',
  styleUrls: ['./bank-presentation.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonLabel,
    IonFooter,
    IonButton,
    LottieComponent,
  ],
})
export class BankPresentationComponent {
  options: AnimationOptions = {
    path: '../assets/lottie/pig.json',
    loop: false,
  };

  private modalCtrl = inject(ModalController);

  close() {
    this.modalCtrl.dismiss();
  }
}
