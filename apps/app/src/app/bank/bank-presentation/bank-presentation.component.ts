import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { IonContent, IonFooter } from '@ionic/angular/standalone';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-bank-presentation',
  templateUrl: './bank-presentation.component.html',
  styleUrls: ['./bank-presentation.component.scss'],
  standalone: true,
  imports: [MatButtonModule, IonContent, IonFooter, LottieComponent],
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
