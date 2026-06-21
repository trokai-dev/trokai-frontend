import { Component, inject } from '@angular/core';
import {
  ModalController,
  IonFooter,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonIcon,
  IonContent,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
    IonFooter,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
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
