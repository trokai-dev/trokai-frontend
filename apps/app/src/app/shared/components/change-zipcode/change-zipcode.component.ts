import { Component, inject } from '@angular/core';
import {
  ModalController,
  IonButton,
  IonFooter,
  IonLabel,
  IonItem,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonIcon,
  IonContent,
  IonInput,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MaskDirective } from '../../directives/mask/mask.directive';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-change-zipcode',
  templateUrl: './change-zipcode.component.html',
  styleUrls: ['./change-zipcode.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonFooter,
    IonButton,
    FormsModule,
    MaskDirective,
  ],
})
export class ChangeZipcodeComponent {
  zipcode = null;

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ close });
  }

  closeExit() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (!this.zipcode || this.zipcode.toString().length < 9) return;

    this.modalCtrl.dismiss({ newZipCode: +this.zipcode.replace('-', '') });
  }
}
