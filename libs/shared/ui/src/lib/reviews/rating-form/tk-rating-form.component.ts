import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Order, User } from '@trokai/shared-core';
import { OrdersService } from '@trokai/shared-data-access';
import { TkUserAvatarComponent } from '../../user/user-avatar/user-avatar.component';

@Component({
  selector: 'tk-rating-form',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    TkUserAvatarComponent,
  ],
  templateUrl: './tk-rating-form.component.html',
  styleUrl: './tk-rating-form.component.scss',
})
export class TkRatingFormComponent {
  @Input() order!: Order;
  @Input() otherUser!: User;
  /** true → the logged user sold (review the buyer); false → bought (review the seller). */
  @Input() isSale = false;

  @Output() reviewed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly positions = [1, 2, 3, 4, 5];

  stars = 0;
  comment = '';
  loading = false;

  private ordersService = inject(OrdersService);

  get firstName(): string {
    return (this.otherUser?.storeName ?? this.otherUser?.name ?? '').split(
      ' ',
    )[0];
  }

  get action(): string {
    return this.isSale ? 'venda' : 'compra';
  }

  get actionVerb(): string {
    return this.isSale ? 'vender para' : 'comprar de';
  }

  rate(stars: number) {
    this.stars = stars;
  }

  async send() {
    if (!this.stars || this.loading) return;
    this.loading = true;
    try {
      await this.ordersService.reviewOrder({
        negotiationId: this.order._id,
        stars: this.stars,
        comment: this.comment,
      });
      this.reviewed.emit();
    } finally {
      this.loading = false;
    }
  }
}
