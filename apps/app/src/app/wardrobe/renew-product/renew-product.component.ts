import { Component, inject } from '@angular/core';
import {
  ModalController,
  IonContent,
  IonFooter,
  IonIcon,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-renew-product',
  templateUrl: './renew-product.component.html',
  styleUrls: ['./renew-product.component.scss'],
  standalone: true,
  imports: [MatButtonModule, IonContent, IonIcon, IonFooter],
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
