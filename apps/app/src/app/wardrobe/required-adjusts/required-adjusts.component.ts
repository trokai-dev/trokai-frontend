import { Component, OnInit, Input, inject } from '@angular/core';
import {
  IonContent,
  IonFooter,
  IonGrid,
  IonIcon,
  IonList,
  IonRow,
  ModalController, IonItem } from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import { close, warning } from 'ionicons/icons';

@Component({
  selector: 'app-required-adjusts',
  templateUrl: './required-adjusts.component.html',
  styleUrls: ['./required-adjusts.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    IonItem,
    IonIcon,
    IonContent,
    IonGrid,
    IonList,
    IonFooter,
    IonRow,
  ],
})
export class RequiredAdjustsComponent {
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ close, warning });
  }

  @Input() itemreview = [];
  @Input() adjusts = [];
  @Input() adjustsNote = null;

  getAdjustInfo(id: number) {
    return this.itemreview.find((item) => item['_id'] === id)['info'];
  }

  close() {
    this.modalCtrl.dismiss();
  }

  adjust() {
    this.modalCtrl.dismiss({
      editProduct: true,
    });
  }
}
