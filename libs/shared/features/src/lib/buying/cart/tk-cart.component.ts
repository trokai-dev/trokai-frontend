import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Clothes, User } from '@trokai/shared-core';
import { Basket } from '@trokai/shared-data-access';
import {
  CostPipe,
  TkReviewStarsComponent,
  TkUserAvatarComponent,
} from '@trokai/shared-ui';
import { TkReserveTimeComponent } from '../reserve-time/tk-reserve-time.component';

/**
 * Shared cart CONTENT (canonical web). The platform shell owns the data (baskets$
 * + suggestion fetch via its own SearchService) and projects the suggestions list
 * via `ng-content select="[suggestions]"`. All navigation/modal intents are
 * emitted; removal/checkout go through the shared BuyingService in the shell.
 */
@Component({
  selector: 'tk-cart',
  standalone: true,
  imports: [
    CurrencyPipe,
    CostPipe,
    MatButtonModule,
    MatIconModule,
    TkUserAvatarComponent,
    TkReviewStarsComponent,
    TkReserveTimeComponent,
  ],
  templateUrl: './tk-cart.component.html',
  styleUrl: './tk-cart.component.scss',
})
export class TkCartComponent {
  @Input() baskets: Basket[] = [];
  @Input() justAdded = false;

  @Output() checkout = new EventEmitter<string>();
  @Output() removeProduct = new EventEmitter<Clothes>();
  @Output() openProduct = new EventEmitter<Clothes>();
  @Output() openOwner = new EventEmitter<User>();
  @Output() openReviews = new EventEmitter<User>();
  @Output() addMore = new EventEmitter<User>();
  @Output() browseProducts = new EventEmitter<void>();

  remove(product: Clothes, ev: Event) {
    ev.stopPropagation();
    this.removeProduct.emit(product);
  }
}
