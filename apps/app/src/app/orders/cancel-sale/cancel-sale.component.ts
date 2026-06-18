import { Order } from '@trokai/shared-core';
import { Component, inject, Input, OnInit } from '@angular/core';
import { OrdersService } from '@trokai/shared-data-access';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonFooter,
  IonGrid,
  IonIcon,
  IonRow,
  ModalController,
  IonButton,
  IonLabel,
  IonSpinner,
  IonText,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, close } from 'ionicons/icons';

@Component({
  selector: 'app-cancel-sale',
  templateUrl: './cancel-sale.component.html',
  styleUrls: ['./cancel-sale.component.scss'],
  standalone: true,
  imports: [
    IonText,
    IonSpinner,
    IonLabel,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonIcon,
    IonFooter,
    FormsModule,
    IonTextarea,
    IonIcon,
  ],
})
export class CancelSaleComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private orderService = inject(OrdersService);

  @Input() order: Order;

  done = false;
  loading = false;
  large = false;
  message = '';

  ngOnInit() {
    addIcons({ close, checkmarkOutline });
  }

  closeExit() {
    this.modalCtrl.dismiss();
  }

  async sendMessage() {
    this.loading = true;

    try {
      await this.orderService.cancelSale(this.order._id, this.message);
      this.done = true;
    } finally {
      this.loading = false;
    }
  }

  formValid() {
    return (
      this.message &&
      this.message.toString().trim() !== '' &&
      this.message.toString().trim().length > 4
    );
  }

  inputArea() {
    if (
      (this.message.match(/[^\n]*\n[^\n]*/gi) &&
        this.message.match(/[^\n]*\n[^\n]*/gi).length > 1) ||
      this.message.toString().length > 28
    ) {
      this.large = true;
    } else {
      this.large = false;
    }
  }
}
