import { Component, Input, inject } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonButtons,
} from '@ionic/angular/standalone';
import { User } from '@trokai/shared-core';
import { ReviewModel } from '@trokai/shared-data-access';
import { BackButtonComponent } from '../back-button/back-button.component';
import { TkReviewsListComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
    IonButtons,
    BackButtonComponent,
    TkReviewsListComponent,
  ],
})
export class ReviewsListComponent {
  @Input() user: User;
  @Input() reviews: ReviewModel[] = [];

  private modalCtrl = inject(ModalController);

  close() {
    this.modalCtrl.dismiss();
  }
}
