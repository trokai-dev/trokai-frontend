import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonTitle,
  IonContent,
  IonFooter,
} from '@ionic/angular/standalone';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-sorting',
  templateUrl: './sorting.component.html',
  styleUrls: ['./sorting.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonIcon,
    IonTitle,
    IonContent,
    IonFooter,
    FormsModule,
    MatRadioModule,
    MatButtonModule,
  ],
})
export class SortingComponent implements OnInit {
  private locationService = inject(GeolocationService);
  private firebaseService = inject(FirebaseService);
  private modalCtrl = inject(ModalController);

  options = [];
  @Input() sorting: string;

  ngOnInit() {
    addIcons({ close });
    console.log('SortingComponent', this.sorting);

    this.options = [
      {
        text: 'Em destaque',
        value: 'relevance',
      },
      {
        text: 'Mais barato',
        value: 'cost',
      },
      {
        text: 'Mais recente',
        value: 'recent',
      },
    ];

    // REMOVE FOR NOW

    // const location = this.locationService.getLocationValue();

    // if (location && location.gps && location.gps.lat) {
    //   this.options.push({
    //     text: 'Mais perto da minha localização',
    //     value: 'distanceGPS',
    //   });
    // }

    // if (location && location.home && location.home.lat) {
    //   this.options.push({
    //     text: 'Mais perto do meu endereço',
    //     value: 'distanceHome',
    //   });
    // }
  }

  closeOnly() {
    this.modalCtrl.dismiss();
  }

  applySorting() {
    this.modalCtrl.dismiss({
      sorted: this.sorting,
    });

    this.logFirebase();
  }

  logFirebase() {
    let eventName = '';

    switch (this.sorting) {
      case 'recent': {
        eventName = 'PESQUISA_SORT_RECENT';
        break;
      }
      case 'cost': {
        eventName = 'PESQUISA_SORT_COST';
        break;
      }
      case 'distanceGPS': {
        eventName = 'PESQUISA_SORT_GPS';
        break;
      }
      case 'distanceHOME': {
        eventName = 'PESQUISA_SORT_HOME';
        break;
      }
    }

    this.firebaseService.log(eventName);
  }
}
