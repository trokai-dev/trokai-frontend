import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonFooter,
  IonGrid,
  ModalController,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-postage-label-presentation',
  templateUrl: './postage-label-presentation.component.html',
  styleUrls: ['./postage-label-presentation.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    
    IonContent,
    IonGrid,
    IonFooter,
    LottieComponent,
  ],
})
export class PostageLabelPresentationComponent {
  private modalCtrl = inject(ModalController);

  options: AnimationOptions = {
    path: '../assets/lottie/postagelabel.json',
    loop: false,
  };

  close() {
    this.modalCtrl.dismiss();
  }
}
