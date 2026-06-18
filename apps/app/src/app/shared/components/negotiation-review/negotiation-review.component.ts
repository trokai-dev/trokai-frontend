import { Order, User } from '@trokai/shared-core';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { TkRatingFormComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-negotiation-review',
  templateUrl: './negotiation-review.component.html',
  styleUrls: ['./negotiation-review.component.scss'],
  standalone: true,
  imports: [IonContent, TkRatingFormComponent],
})
export class NegotiationReviewComponent implements OnInit {
  @Input() order: Order;
  @Input() otherUser: User;

  isSale = false;

  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);

  ngOnInit() {
    const user = this.authService.getUserValue();
    this.isSale = this.order?.seller?.['_id'] === user?._id;
  }

  close(didReview?: boolean) {
    this.modalCtrl.dismiss({ didReview });
  }
}
