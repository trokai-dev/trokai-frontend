import { Component, inject } from '@angular/core';
import {
  ModalController,
  IonContent,
  IonButton,
  IonFooter,
  IonGrid,
  IonIcon,
  IonRow,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-renew-product',
  templateUrl: './renew-product.component.html',
  styleUrls: ['./renew-product.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonGrid, IonFooter, IonRow],
})
export class RenewProductComponent {
  private modalCtrl = inject(ModalController);

  renew() {
    this.modalCtrl.dismiss({ renew: true });
  }

  editFirst() {
    this.modalCtrl.dismiss({ editFirst: true });
  }
}
