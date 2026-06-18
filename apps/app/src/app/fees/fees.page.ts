import { CostPipe } from '@trokai/shared-ui';
import { Component, OnInit, inject } from '@angular/core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { CurrencyPipe } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar, IonRow, IonCol, IonLabel, IonGrid } from '@ionic/angular/standalone';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.page.html',
  styleUrls: ['./fees.page.scss'],
  standalone: true,
  imports: [IonGrid, IonLabel, IonCol, IonRow,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    BackButtonComponent,
    CurrencyPipe,
    CostPipe,
  ],
})
export class FeesPage implements OnInit {
  private globalService = inject(GlobalService);

  params;

  ngOnInit() {
    this.globalService.params().subscribe((params) => {
      this.params = params;
    });
  }
}
